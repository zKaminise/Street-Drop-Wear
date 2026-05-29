import os
import glob

base = 'D:/Downloads/Claude App/StreetDropWear'
patterns = ['app/**/*.tsx', 'app/**/*.ts', 'components/**/*.tsx', 'components/**/*.ts']

# Mojibake fixes: corrupted -> correct UTF-8
FIXES = [
    # Portuguese compound sequences (order matters - fix longer first)
    ('Ã§Ã£o', 'ção'),
    ('Ã§Ã£', 'çã'),
    ('Ã£o', 'ão'),
    ('Ã§Ã¡', 'çá'),
    # Individual chars
    ('Ã§', 'ç'),
    ('Ã‡', 'Ç'),
    ('Ã£', 'ã'),
    ('Ã¡', 'á'),
    ('Ã©', 'é'),
    ('Ãª', 'ê'),
    ('Ã­', 'í'),
    ('Ã³', 'ó'),
    ('Ãº', 'ú'),
    ('Ã‰', 'É'),
    ('Ãµ', 'õ'),
    ('Ã¢', 'â'),
    ('Ã€', 'À'),
    # Latin extras
    ('Â·', '·'),
    ('Âº', 'º'),
    ('Â°', '°'),
    ('Âª', 'ª'),
    ('Â»', '»'),
    ('Â«', '«'),
    # En/em dashes (mojibake version - NOT the smart quotes we fixed with byte replacement)
    ('â€"', '–'),
    ('â€™', '’'),
    ('â€˜', '‘'),
    ('â€¢', '•'),
    # Stars/bullets
    ('â˜…', '★'),
    ('â—', '●'),
    # Cleanup trailing Â
    ('Â ', ' '),
]

fixed = 0
for pat in patterns:
    for fpath in glob.glob(os.path.join(base, pat), recursive=True):
        try:
            with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
                orig = f.read()
            content = orig
            for old, new in FIXES:
                content = content.replace(old, new)
            if content != orig:
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(content)
                fixed += 1
                print('Fixed: ' + os.path.relpath(fpath, base))
        except Exception as e:
            print('ERROR: ' + str(e))

print('\nTotal files fixed: ' + str(fixed))
