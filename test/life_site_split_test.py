import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class LifeSiteBoundaryTest(unittest.TestCase):
    def test_life_site_data_contains_only_finance_ai_and_scenery_topics(self):
        """A clean-energy or carbon feed must not be published on the life site."""
        data = json.loads((ROOT / "data/weekly-intelligence.json").read_text())

        self.assertEqual(
            {topic["id"] for topic in data["topics"]},
            {"stocks", "commodities", "ai", "scenery"},
        )

    def test_life_home_uses_the_public_site_name_and_keeps_the_time_box(self):
        """The second site must have its own identity while preserving time fragments."""
        home = (ROOT / "index.html").read_text()

        self.assertIn("我的生活：财经、AI与风景", home)
        self.assertIn('href="memories.html"', home)

    def test_life_site_does_not_group_carbon_with_finance_filters(self):
        """Carbon trading remains on the clean-energy site instead of leaking into finance."""
        script = (ROOT / "script.js").read_text()

        self.assertIn('topicIds: ["stocks", "commodities"]', script)
        self.assertNotIn('topicIds: ["stocks", "carbon", "commodities"]', script)


if __name__ == "__main__":
    unittest.main()
