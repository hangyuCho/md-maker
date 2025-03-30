# h9-cli-md-maker

A CLI tool for creating markdown files from YAML templates with multilingual support.

## Features

- Create markdown files from YAML templates
- Multilingual support (English, Korean, Japanese)
- Customizable templates
- Automatic ID generation
- File overwrite protection
- Last used path memory

## Installation

```bash
npm install -g h9-cli-md-maker
```

## Usage

```bash
md-maker create
```

## Template Format

Create a YAML file with the following format:

```yaml
name: Template Name
description: Template Description
language: en  # or ko, ja
fields:
  - name: fieldName
    type: input  # or list, checkbox
    message: Field message
    choices:  # for list type
      - Choice 1
      - Choice 2
    default: Default value
    when: (answers) => true  # conditional field
stepFormat: |
  ### Step {{index}}
  - Time: {{time}}
  - Water: {{water}}
  - Total: {{total}}
  - Description: {{description}}
template: |
  # {{title}}
  {{description}}
  ...
```

## Example Template

See `md-format-coffee-recipe-*.yml` files for examples.

## License

ISC 