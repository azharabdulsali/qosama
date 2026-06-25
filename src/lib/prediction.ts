import * as ort from 'onnxruntime-web';
import path from 'path';
import fs from 'fs';

// Cached ONNX inference session
let session: ort.InferenceSession | null = null;

// Fix Next.js Server Action WASM path resolution
ort.env.wasm.wasmPaths = path.join(process.cwd(), 'node_modules', 'onnxruntime-web', 'dist') + '/';
ort.env.wasm.numThreads = 1; // Disable multi-threading for WASM serverless stability

async function getSession(): Promise<ort.InferenceSession> {
  if (!session) {
    const modelPath = path.join(process.cwd(), 'model.onnx');
    const modelBuffer = fs.readFileSync(modelPath);
    session = await ort.InferenceSession.create(modelBuffer);
  }
  return session;
}

// StandardScaler parameters derived from the training dataset
// Feature order: ['Bobot_Urgensi', 'Sisa_Hari', 'Berat (Kg)', 'Antrean', 'SDM']
const MEANS = [
  1.7364475201845444,
  0.01903114186851211,
  2.4067474048442903,
  3.2918108419838523,
  2.4013840830449826
];

const SCALES = [
  0.7077412275470071,
  0.2071000019190968,
  1.1642777623153269,
  2.9461079944315713,
  0.7110256567415869
];

function scaleFeature(val: number, index: number): number {
  return (val - MEANS[index]) / SCALES[index];
}

export type PriorityPrediction = 'Prioritas Tinggi' | 'Prioritas Sedang' | 'Prioritas Rendah';

export async function predictPriority(
  jenisLayanan: 'Reguler' | 'Express' | 'Extra Express',
  berat: number,
  antrean: number, // 0-indexed relative position in the active queue
  sdm: number,      // active workers count
  tanggalMasuk: string | Date,
  estimasiSelesai?: string | null
): Promise<{ priority: PriorityPrediction; sisaHariSorting: number }> {
  // 1. Mapping service options to Bobot_Urgensi and Batas_Waktu
  const mapping = {
    'Reguler': { bobot: 1, sisa: 3 },
    'Express': { bobot: 2, sisa: 2 },
    'Extra Express': { bobot: 3, sisa: 1 }
  };

  const currentMap = mapping[jenisLayanan] || mapping['Reguler'];
  const bobotVal = currentMap.bobot;
  const batasWaktu = currentMap.sisa;

  // 2. Dynamic Remaining Days Calculation
  const now = new Date();
  const nowStr = now.toISOString().split('T')[0];
  const nowDate = new Date(nowStr);
  
  let sisaHariSorting: number;

  if (estimasiSelesai) {
    // If we have an explicit estimation date, sisaHari is exactly the difference between now and that date
    const estDate = new Date(estimasiSelesai);
    const estStr = estDate.toISOString().split('T')[0];
    const targetDate = new Date(estStr);
    sisaHariSorting = Math.floor((targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // Fallback: use legacy SLA based calculation
    const start = new Date(tanggalMasuk);
    const startStr = start.toISOString().split('T')[0];
    const startDate = new Date(startStr);
    const diffDays = Math.floor((nowDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    sisaHariSorting = batasWaktu - diffDays;
  }

  const sisaHariModel = Math.max(0, sisaHariSorting); // clip to 0 for model standard range

  // 3. Scale inputs using the fitted StandardScaler parameters
  const inputScaled = new Float32Array([
    scaleFeature(bobotVal, 0),
    scaleFeature(sisaHariModel, 1),
    scaleFeature(berat, 2),
    scaleFeature(antrean, 3),
    scaleFeature(sdm, 4)
  ]);

  try {
    // 4. Run ONNX prediction (fetching only output_label to avoid map sequence errors in Node bindings)
    const ortSession = await getSession();
    const inputTensor = new ort.Tensor('float32', inputScaled, [1, 5]);
    const feeds = { [ortSession.inputNames[0]]: inputTensor };
    const results = await ortSession.run(feeds, ['output_label']);

    const priority = results.output_label.data[0] as PriorityPrediction;

    return {
      priority,
      sisaHariSorting
    };
  } catch (error) {
    console.error("ONNX Prediction error:", error);
    // Fallback to basic heuristics if ML fails
    let fallbackPriority: PriorityPrediction = "Prioritas Sedang";
    if (sisaHariSorting <= 0 || jenisLayanan === 'Extra Express') {
      fallbackPriority = "Prioritas Tinggi";
    } else if (sisaHariSorting > 2 && jenisLayanan === 'Reguler') {
      fallbackPriority = "Prioritas Rendah";
    }
    
    return {
      priority: fallbackPriority,
      sisaHariSorting
    };
  }
}
