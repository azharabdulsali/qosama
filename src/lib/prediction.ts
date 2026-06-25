import * as ort from 'onnxruntime-node';
import path from 'path';

// Cached ONNX inference session
let session: ort.InferenceSession | null = null;

async function getSession(): Promise<ort.InferenceSession> {
  if (!session) {
    const modelPath = path.join(process.cwd(), 'model.onnx');
    session = await ort.InferenceSession.create(modelPath);
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
  tanggalMasuk: string | Date
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

  // 2. Dynamic Remaining Days Calculation based on calendar days elapsed
  const start = new Date(tanggalMasuk);
  const now = new Date();
  
  // Extract date string to ignore hours and calculate calendar day difference
  const startStr = start.toISOString().split('T')[0];
  const nowStr = now.toISOString().split('T')[0];
  const startDate = new Date(startStr);
  const nowDate = new Date(nowStr);
  const diffDays = Math.floor((nowDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const sisaHariSorting = batasWaktu - diffDays;
  const sisaHariModel = Math.max(0, sisaHariSorting); // clip to 0 for model standard range

  // 3. Scale inputs using the fitted StandardScaler parameters
  const inputScaled = new Float32Array([
    scaleFeature(bobotVal, 0),
    scaleFeature(sisaHariModel, 1),
    scaleFeature(berat, 2),
    scaleFeature(antrean, 3),
    scaleFeature(sdm, 4)
  ]);

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
}
