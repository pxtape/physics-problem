import unittest, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class WebBankTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.bank=json.loads((ROOT/'web/problems.json').read_text())
    def test_all_source_problems_present(self):
        self.assertEqual([p['number'] for p in self.bank],list(range(1,61)))
        for p in self.bank:
            self.assertTrue((ROOT/p['sourcePath']).is_file())
            self.assertEqual(p['status'],'needs-review')
    def test_figures_exist_and_tikz_is_not_leaked(self):
        for p in self.bank:
            self.assertNotIn('tikzpicture',p['html'])
            for asset in re.findall('src="([^"]+)"',p['html']): self.assertTrue((ROOT/'web'/asset).is_file(),asset)
    def test_no_unhandled_text_macros_or_placeholders(self):
        for p in self.bank:
            text=re.sub(r'\\\(.*?\\\)|\\\[.*?\\\]','',p['html'],flags=re.S)
            self.assertNotRegex(text,r'\\[a-zA-Z]+',p['id'])
            self.assertNotIn('@@FIG',text)
    def test_latex_and_choices_are_retained(self):
        p=self.bank[4]
        self.assertIn('4\\pi^2',p['html'])
        self.assertEqual(p['html'].count('<li>'),4)
        self.assertEqual(self.bank[44]['html'].count('<li>'),4)
        self.assertIn('ความสูง',self.bank[57]['html'])
        self.assertIn('assets/MEC-0058-1.svg',self.bank[57]['html'])
if __name__=='__main__': unittest.main()
