// app/lib/dataset.ts
import fs from "fs/promises";
import path from "path";

export type TourismRow = {
  Province: string;
  Year: string;
  Month: string;
  Tourism_Type: string;
  "Income(Million Baht)": string;
  Tourism_Amount: string;
  Province_ENG: string;
};

export async function loadDataset(): Promise<TourismRow[]> {
  const filePath = path.join(process.cwd(), "app", "data", "Dataset.csv");
  const csv = await fs.readFile(filePath, "utf-8");

  const lines = csv.trim().split("\n");
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(",");

  const data: TourismRow[] = rows.map((line) => {
    const cols = line.split(",");
    const row: any = {};
    headers.forEach((h, i) => {
      row[h] = cols[i];
    });
    return row as TourismRow;
  });

  return data;
}

// 👇 ฟังก์ชันใหม่: รวมข้อมูลต่อจังหวัด (2023–2025)
export type ProvinceStats = {
  Province_ENG: string;
  thaiTourists: number;
  foreignTourists: number;
  totalIncome: number; // ล้านบาท
};
export const TH_TO_ENG: Record<string, string> = {
  "กรุงเทพมหานคร": "Bangkok",
  "กระบี่": "Krabi",
  "กาญจนบุรี": "Kanchanaburi",
  "กาฬสินธุ์": "Kalasin",
  "กำแพงเพชร": "Kamphaeng Phet",
  "ขอนแก่น": "Khon Kaen",
  "จันทบุรี": "Chanthaburi",
  "ฉะเชิงเทรา": "Chachoengsao",
  "ชลบุรี": "Chon Buri",
  "ชัยนาท": "Chai Nat",
  "ชัยภูมิ": "Chaiyaphum",
  "ชุมพร": "Chumphon",
  "เชียงราย": "Chiang Rai",
  "เชียงใหม่": "Chiang Mai",
  "ตรัง": "Trang",
  "ตราด": "Trat",
  "ตาก": "Tak",
  "นครนายก": "Nakhon Nayok",
  "นครปฐม": "Nakhon Pathom",
  "นครพนม": "Nakhon Phanom",
  "นครราชสีมา": "Nakhon Ratchasima",
  "นครศรีธรรมราช": "Nakhon Si Thammarat",
  "นครสวรรค์": "Nakhon Sawan",
  "นนทบุรี": "Nonthaburi",
  "นราธิวาส": "Narathiwat",
  "น่าน": "Nan",
  "บึงกาฬ": "Bueng Kan",
  "บุรีรัมย์": "Buri Ram",
  "ปทุมธานี": "Pathum Thani",
  "ประจวบคีรีขันธ์": "Prachuap Khiri Khan",
  "ปราจีนบุรี": "Prachin Buri",
  "ปัตตานี": "Pattani",
  "พระนครศรีอยุธยา": "Phra Nakhon Si Ayutthaya",
  "พะเยา": "Phayao",
  "พังงา": "Phangnga",
  "พัทลุง": "Phatthalung",
  "พิจิตร": "Phichit",
  "พิษณุโลก": "Phitsanulok",
  "เพชรบุรี": "Phetchaburi",
  "เพชรบูรณ์": "Phetchabun",
  "แพร่": "Phrae",
  "ภูเก็ต": "Phuket",
  "มหาสารคาม": "Maha Sarakham",
  "มุกดาหาร": "Mukdahan",
  "แม่ฮ่องสอน": "Mae Hong Son",
  "ยโสธร": "Yasothon",
  "ยะลา": "Yala",
  "ร้อยเอ็ด": "Roi Et",
  "ระนอง": "Ranong",
  "ระยอง": "Rayong",
  "ราชบุรี": "Ratchaburi",
  "ลพบุรี": "Lop Buri",
  "ลำปาง": "Lampang",
  "ลำพูน": "Lamphun",
  "เลย": "Loei",
  "ศรีสะเกษ": "Sri Sa Ket",
  "สกลนคร": "Sakon Nakhon",
  "สงขลา": "Songkhla",
  "สตูล": "Satun",
  "สมุทรปราการ": "Samut Prakan",
  "สมุทรสงคราม": "Samut Songkhram",
  "สมุทรสาคร": "Samut Sakhon",
  "สระแก้ว": "Sa Kaeo",
  "สระบุรี": "Saraburi",
  "สิงห์บุรี": "Sing Buri",
  "สุโขทัย": "Sukhothai",
  "สุพรรณบุรี": "Suphan Buri",
  "สุราษฎร์ธานี": "Surat Thani",
  "สุรินทร์": "Surin",
  "หนองคาย": "Nong Khai",
  "หนองบัวลำภู": "Nong Bua Lam Phu",
  "อ่างทอง": "Ang Thong",
  "อำนาจเจริญ": "Amnat Charoen",
  "อุดรธานี": "Udon Thani",
  "อุตรดิตถ์": "Uttaradit",
  "อุทัยธานี": "Uthai Thani",
  "อุบลราชธานี": "Ubon Ratchathani"
};

export async function getProvinceStats(): Promise<ProvinceStats[]> {
  const data = await loadDataset();
  const map = new Map<string, ProvinceStats>();

  for (const row of data) {
    const year = Number(row.Year);
    if (year < 2023 || year > 2025) continue;

    // ถ้ามี Province_ENG ให้ใช้, ถ้าไม่มีก็ใช้ Province (ภาษาไทยไปก่อนก็ได้)
    const provinceEng = TH_TO_ENG[row.Province.trim()];
    if (!provinceEng) continue;

    const amount =
      Number(row.Tourism_Amount?.replace(/,/g, "")) || 0;
    const income =
      Number(row["Income(Million Baht)"]?.replace(/,/g, "")) || 0;

    if (!map.has(provinceEng)) {
      map.set(provinceEng, {
        Province_ENG: provinceEng,
        thaiTourists: 0,
        foreignTourists: 0,
        totalIncome: 0,
      });
    }

    const stats = map.get(provinceEng)!;

    if (row.Tourism_Type === "ไทย") {
      stats.thaiTourists += amount;
    } else if (row.Tourism_Type === "ต่างชาติ") {
      stats.foreignTourists += amount;
    }

    stats.totalIncome += income;
  }

  return Array.from(map.values());
}