# @laddro/career-cli

CLI for the [Laddro Career API](https://api.laddro.com/reference). Tailor resumes, generate cover letters, and export PDFs from your terminal.

## Install

```bash
npm install -g @laddro/career-cli
```

## Quick start

```bash
# Save your API key
laddro login laddro_live_...

# List your resumes
laddro resumes

# Tailor a resume for a job
laddro tailor "Senior Frontend Engineer" --job-url https://jobs.example.com/sfe

# Generate a cover letter
laddro cover-letter generate "Product Manager" --job-url https://jobs.example.com/pm

# Export as PDF with a different template
laddro export abc-123 --template COBALT --output my-resume.pdf

# Parse and render an existing PDF
laddro parse ./old-resume.pdf --template GRAPHITE

# Browse templates
laddro templates
laddro templates GRAPHITE

# Configure BYOK
laddro settings set --provider Anthropic --model claude-sonnet-4-20250514 --key sk-ant-...
```

## Commands

| Command | Description |
|---|---|
| `login <key>` | Save API key to `~/.laddro/config.json` |
| `logout` | Remove saved API key |
| `resumes` | List your resumes |
| `tailor <position>` | Tailor resume for a job |
| `export <id>` | Export resume as PDF |
| `parse <file>` | Parse PDF and render with template |
| `cover-letter list` | List cover letters |
| `cover-letter generate <position>` | Generate cover letter |
| `templates [id]` | Browse templates |
| `settings` | View AI config |
| `settings set` | Set BYOK provider |
| `settings remove` | Remove AI config |

## Environment variables

| Variable | Description |
|---|---|
| `LADDRO_API_KEY` | API key (overrides config file) |
| `LADDRO_BASE_URL` | Custom API URL |

## Links

- [laddro.com](https://laddro.com)
- [API Reference](https://api.laddro.com/reference)
- [Docs](https://docs.laddro.com)
- [GitHub](https://github.com/laddro-app)

## License

MIT
