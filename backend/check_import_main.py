import importlib, traceback
try:
    importlib.import_module('main')
    print('IMPORTED MAIN')
except Exception:
    traceback.print_exc()
