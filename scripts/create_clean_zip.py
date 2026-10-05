import os
import zipfile
import shutil

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
zip_path = os.path.join(root_dir, "communiq.zip")

EXCLUDE_DIRS = {
    'node_modules',
    'dist',
    'screenshots',
    '.git',
    '.pytest_cache',
    '__pycache__',
    '.venv',
    'venv',
}

EXCLUDE_FILES = {
    '.env',
    'communiq.zip',
    '.DS_Store',
    'thumbs.db'
}

print(f"Creating clean zip from: {root_dir}")
file_count = 0
total_uncompressed_bytes = 0

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to avoid descending into excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.git')]

        for file in files:
            if file in EXCLUDE_FILES or file.endswith('.pyc') or file.endswith('.zip'):
                continue
            abs_path = os.path.join(root, file)
            rel_path = os.path.relpath(abs_path, root_dir)
            size = os.path.getsize(abs_path)
            total_uncompressed_bytes += size
            file_count += 1
            zipf.write(abs_path, rel_path)

zip_size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"Zip created successfully!")
print(f"Files included: {file_count}")
print(f"Uncompressed size: {total_uncompressed_bytes / (1024 * 1024):.2f} MB")
print(f"Zip file size: {zip_size_mb:.2f} MB")
print(f"Location: {zip_path}")

# Also copy to artifact directory for easy download access
artifact_dir = r"C:\Users\Vinayaka\.gemini\antigravity\brain\30710bf3-484d-4ee3-81e1-f8c773cf2cc6"
if os.path.exists(artifact_dir):
    artifact_zip = os.path.join(artifact_dir, "communiq.zip")
    shutil.copy2(zip_path, artifact_zip)
    print(f"Copied to artifact directory: {artifact_zip}")
