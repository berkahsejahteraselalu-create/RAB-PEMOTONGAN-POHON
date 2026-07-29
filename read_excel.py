import pandas as pd
import json

file = "c:\\Users\\Windows 11\\Documents\\RAB DAN ANALISA PEMOTONGAN POHON\\RAB_Pemotongan_Pohon_AHSP2026.xlsx"
out_file = "c:\\Users\\Windows 11\\Documents\\RAB DAN ANALISA PEMOTONGAN POHON\\excel_dump.txt"
try:
    with open(out_file, "w", encoding="utf-8") as f:
        xl = pd.ExcelFile(file)
        for sheet in xl.sheet_names:
            f.write(f"=== Sheet: {sheet} ===\n")
            df = pd.read_excel(file, sheet_name=sheet, header=None)
            for i, row in df.head(100).iterrows():
                f.write(f"{i}: {row.tolist()}\n")
except Exception as e:
    print(f"Error: {e}")
