import os

app_dir = os.path.join(os.path.dirname(__file__), 'app')

replacements = {
    'from app.base.model import': 'from app.base.BaseModel import',
    'import app.base.model': 'import app.base.BaseModel',
    'from app.base.repository import': 'from app.base.BaseRepo import',
    'import app.base.repository': 'import app.base.BaseRepo',
    'from app.base.manager import': 'from app.base.BaseManager import',
    'import app.base.manager': 'import app.base.BaseManager',
    'from app.base.service import': 'from app.base.BaseService import',
    'import app.base.service': 'import app.base.BaseService',
    'from app.core.services.cloudinary_service import': 'from app.features.shared.services.cloudinary_service import',
    'import app.core.services.cloudinary_service': 'import app.features.shared.services.cloudinary_service'
}

for root, dirs, files in os.walk(app_dir):
    if '__pycache__' in dirs:
        dirs.remove('__pycache__')
    for file in files:
        if file.endswith('.py'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            for old, new in replacements.items():
                content = content.replace(old, new)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
