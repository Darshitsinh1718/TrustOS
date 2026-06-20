import sys
from pathlib import Path
repo_root = Path(__file__).resolve().parent
sys.path.insert(0, str(repo_root))

import uvicorn

if __name__ == '__main__':
    uvicorn.run('backend.main:app', host='127.0.0.1', port=8000, reload=True)
