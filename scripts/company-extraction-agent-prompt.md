# Company Information Extraction

Extract company information for [COMPANY_NAME] using web search and return it as JSON.

## Required Information
- **Headquarters**: City, Country (full address preferred)
- **Founded**: Year established (integer)
- **Employees**: Current employee count (integer)
- **Revenue**: Annual revenue with currency and year

## Instructions
1. Search for the company's official website
2. Look for About, Investor Relations, or Company pages
3. Extract the required information from official sources
4. Return ONLY the JSON object with no additional text

## Output Format
Return exactly this JSON structure with no additional text:

```json
{
  "id": "company_id",
  "name": "[COMPANY_NAME]",
  "parent_id": null,
  "headquarters": "City, Country",
  "founded": 1965,
  "employees": 270000,
  "revenue": "$91.4 billion (2024)",
  "infoSearchDate": "2025-08-01T12:00:00.000Z",
  "infoSearchStatus": "success",
  "infoSources": {
    "headquarters": "https://company.com/about",
    "founded": "https://company.com/history",
    "employees": "https://company.com/about",
    "revenue": "https://company.com/investors"
  }
}
```

## Notes
- Use `null` for missing information
- Set `infoSearchStatus` to "partial" if some data missing, "failed" if no data found
- Prioritize official company sources over third-party sites
- Use most recent data available (prefer 2024, then 2023)

Extract information for [COMPANY_NAME] and return ONLY the JSON object below with no explanatory text, markdown formatting, or additional commentary. Output should be valid JSON that can be directly saved to a file.