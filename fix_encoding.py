#!/usr/bin/env python3
"""Fix mojibake (double-encoding) in all .ts and .tsx files."""
import os
import re

BASE = r"D:\Downloads\Claude App\StreetDropWear"

# Replacements ordered from most-specific (compound) to least-specific
REPLACEMENTS = [
    # Compound words first (must come before single-char replacements)
    ("Ã§Ã£o", "ção"),
    ("Ã£o", "ão"),
    ("Ã­cio", "ício"),
    ("ImpressÃ£o", "Impressão"),
    ("AlgodÃ£o", "Algodão"),
    ("disponÃ­veis", "disponíveis"),
    ("disponÃ­vel", "disponível"),
    ("GrÃ¡tis", "Grátis"),
    ("Ãºteis", "úteis"),
    ("ProduÃ§Ã£o", "Produção"),
    ("ConfirmaÃ§Ã£o", "Confirmação"),
    ("AvaliaÃ§Ã£o", "Avaliação"),
    ("CriaÃ§Ã£o", "Criação"),
    ("RevisÃ£o", "Revisão"),
    ("EndereÃ§o", "Endereço"),
    ("SelecÃ§Ã£o", "Seleção"),
    ("AutenticaÃ§Ã£o", "Autenticação"),
    ("InÃ­cio", "Início"),
    # Single character replacements
    ("Ã£", "ã"),
    ("Ã¡", "á"),
    ("Ã©", "é"),
    ("Ãª", "ê"),
    ("Ã­", "í"),
    ("Ã³", "ó"),
    ("Ãº", "ú"),
    ("Ã§", "ç"),
    ("Ã‡", "Ç"),
    ("Ã‚", "Â"),
    ("Â·", "·"),
    ("Âº", "º"),
    ("Â°", "°"),
    ("Âª", "ª"),
    # Special characters
    ("â€"", "–"),   # em dash (map both to en dash as instructed)
    ("â€“", "–"),  # alternative em dash bytes if any
    ("â€¢", "•"),
    ("â€˜", "‘"),  # left single quote '
    ("â€™", "’"),  # right single quote '
    ("â€œ", "“"),  # left double quote "
    ("â€\x9d", "”"),  # right double quote "
    ("â€", "”"),   # fallback for right double quote
    ("â†©", "↩"),
    ("â†ª", "↪"),
    ("â‰¥", "≥"),
]

def fix_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(path, 'r', encoding='latin-1') as f:
                content = f.read()
        except Exception as e:
            print(f"  ERROR reading {path}: {e}")
            return False

    original = content
    for bad, good in REPLACEMENTS:
        content = content.replace(bad, good)

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

dirs_to_scan = [
    os.path.join(BASE, "app"),
    os.path.join(BASE, "components"),
    os.path.join(BASE, "lib"),
    os.path.join(BASE, "prisma"),
]

modified = []
scanned = 0

for d in dirs_to_scan:
    for root, dirs, files in os.walk(d):
        for fname in files:
            if fname.endswith('.ts') or fname.endswith('.tsx'):
                fpath = os.path.join(root, fname)
                scanned += 1
                if fix_file(fpath):
                    rel = os.path.relpath(fpath, BASE)
                    modified.append(rel)
                    print(f"  FIXED: {rel}")

print(f"\nScanned {scanned} files, fixed {len(modified)} files.")
