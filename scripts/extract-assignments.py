"""Re-extract only actual graded weeks. Requires Poppler pdftotext on PATH."""
import os
import subprocess
from pathlib import Path
root=Path(__file__).resolve().parent.parent
binary=os.environ.get('PDFTOTEXT','pdftotext')
for week,start,end in [(1,6,11),(2,15,21),(3,33,53),(5,93,116),(6,128,150)]:
    subprocess.run([binary,'-layout','-f',str(start),'-l',str(end),str(root/'Graded Assignment/cs1001Assignments.pdf'),str(root/f'Graded Assignment/week{week}.txt')],check=True)
subprocess.run(['node','Graded Assignment/build-data.mjs'],cwd=root,check=True)
