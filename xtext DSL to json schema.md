{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://www.xtext.org/language/relis/Relis",
  "title": "Relis DSL Schema",
  "description": "JSON Schema representation of the Relis Xtext grammar for systematic literature review configuration",
  "type": "object",
  "required": ["project"],
  "additionalProperties": false,
  "properties": {
    "project": {
      "$ref": "#/definitions/Project"
    }
  },
  "definitions": {
    "Project": {
      "type": "object",
      "description": "PROJECT short_name name",
      "required": ["short_name", "name", "category"],
      "additionalProperties": false,
      "properties": {
        "short_name": {
          "type": "string",
          "description": "ID - short identifier for the project",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "name": {
          "type": "string",
          "description": "STRING - full name of the project"
        },
        "screening": {
          "$ref": "#/definitions/Screening",
          "description": "Optional SCREENING block"
        },
        "quality_assess": {
          "$ref": "#/definitions/QA",
          "description": "Optional QA block (only valid if screening is present)"
        },
        "category": {
          "type": "array",
          "description": "DATA EXTRACTION - one or more Category entries",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Category"
          }
        },
        "reporting": {
          "type": "array",
          "description": "Optional SYNTHESIS block containing Report entries",
          "items": {
            "$ref": "#/definitions/Report"
          }
        }
      }
    },
    "Screening": {
      "type": "object",
      "description": "SCREENING block with review, conflict, criteria, sources, strategies, validation, and phases",
      "required": ["review_per_paper", "conflict_type", "conflict_resolution", "exclusion_criteria"],
      "additionalProperties": false,
      "properties": {
        "review_per_paper": {
          "type": "integer",
          "description": "Reviews - number of reviews per paper (INT)"
        },
        "conflict_type": {
          "$ref": "#/definitions/ConflictType",
          "description": "Conflict 'we' conflict_type"
        },
        "conflict_resolution": {
          "$ref": "#/definitions/ConflictResolution",
          "description": "'resolved_by' conflict_resolution"
        },
        "exclusion_criteria": {
          "type": "array",
          "description": "Criteria = [ Values, ... ]",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Values"
          }
        },
        "source_papers": {
          "type": "array",
          "description": "Optional Sources = [ Values, ... ]",
          "items": {
            "$ref": "#/definitions/Values"
          }
        },
        "search_strategy": {
          "type": "array",
          "description": "Optional Strategies = [ Values, ... ]",
          "items": {
            "$ref": "#/definitions/Values"
          }
        },
        "validation_percentage": {
          "type": "integer",
          "description": "Optional Validation percentage (INT followed by %)",
          "minimum": 0,
          "maximum": 100
        },
        "validation_assignment_mode": {
          "$ref": "#/definitions/AssignmentMode",
          "description": "Optional assignment mode for validation (only valid if validation_percentage is present)"
        },
        "phases": {
          "type": "array",
          "description": "Optional Phases ( Phase, ... )",
          "items": {
            "$ref": "#/definitions/Phase"
          }
        }
      }
    },
    "QA": {
      "type": "object",
      "description": "Quality Assessment block with questions, responses, and minimum score",
      "required": ["question", "response", "min_score"],
      "additionalProperties": false,
      "properties": {
        "question": {
          "type": "array",
          "description": "Questions = [ STRING, ... ]",
          "minItems": 1,
          "items": {
            "type": "string"
          }
        },
        "response": {
          "type": "array",
          "description": "Answers = [ Response, ... ]",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Response"
          }
        },
        "min_score": {
          "$ref": "#/definitions/DOUBLE",
          "description": "Min_score - minimum score threshold (DOUBLE)"
        }
      }
    },
    "Response": {
      "type": "object",
      "description": "title : score",
      "required": ["title", "score"],
      "additionalProperties": false,
      "properties": {
        "title": {
          "type": "string",
          "description": "STRING - response title"
        },
        "score": {
          "$ref": "#/definitions/DOUBLE",
          "description": "DOUBLE - score value for this response"
        }
      }
    },
    "Report": {
      "description": "SimpleGraph | CompareGraph",
      "oneOf": [
        { "$ref": "#/definitions/SimpleGraph" },
        { "$ref": "#/definitions/CompareGraph" }
      ]
    },
    "SimpleGraph": {
      "type": "object",
      "description": "Simple name (title)? we value charts(...)",
      "required": ["report_type", "name", "value", "chart"],
      "additionalProperties": false,
      "properties": {
        "report_type": {
          "type": "string",
          "const": "Simple",
          "description": "Discriminator: identifies this as a SimpleGraph"
        },
        "name": {
          "type": "string",
          "description": "ID - identifier for the graph",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "title": {
          "type": "string",
          "description": "Optional STRING - display title for the graph"
        },
        "value": {
          "type": "string",
          "description": "Reference to a Category by ID (cross-reference [Category|ID])",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "chart": {
          "type": "array",
          "description": "charts( GraphType, ... )",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/GraphType"
          }
        }
      }
    },
    "CompareGraph": {
      "type": "object",
      "description": "Compared name (title)? we value with reference charts(...)",
      "required": ["report_type", "name", "value", "reference", "chart"],
      "additionalProperties": false,
      "properties": {
        "report_type": {
          "type": "string",
          "const": "Compared",
          "description": "Discriminator: identifies this as a CompareGraph"
        },
        "name": {
          "type": "string",
          "description": "ID - identifier for the graph",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "title": {
          "type": "string",
          "description": "Optional STRING - display title for the graph"
        },
        "value": {
          "type": "string",
          "description": "Reference to a Category by ID (cross-reference [Category|ID])",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "reference": {
          "type": "string",
          "description": "Reference to a Category by ID for comparison (cross-reference [Category|ID])",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "chart": {
          "type": "array",
          "description": "charts( GraphType, ... )",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/GraphType"
          }
        }
      }
    },
    "Phase": {
      "type": "object",
      "description": "Phase with title, optional description, and optional fields",
      "required": ["title"],
      "additionalProperties": false,
      "properties": {
        "title": {
          "type": "string",
          "description": "STRING - phase title"
        },
        "description": {
          "type": "string",
          "description": "Optional STRING - phase description"
        },
        "fields": {
          "type": "array",
          "description": "Optional Fields ( Fields, ... )",
          "items": {
            "$ref": "#/definitions/Fields"
          }
        }
      }
    },
    "Category": {
      "description": "FreeCategory | StaticCategory | IndependentDynamicCategory | DependentDynamicCategory",
      "oneOf": [
        { "$ref": "#/definitions/FreeCategory" },
        { "$ref": "#/definitions/StaticCategory" },
        { "$ref": "#/definitions/IndependentDynamicCategory" },
        { "$ref": "#/definitions/DependentDynamicCategory" }
      ]
    },
    "FreeCategory": {
      "type": "object",
      "description": "Simple name (title)? (mandatory)? ([numberOfValues])? : type (max_char)? (style(pattern))? (= [initial_value])? { sub_categories }?",
      "required": ["category_type", "name", "type"],
      "additionalProperties": false,
      "properties": {
        "category_type": {
          "type": "string",
          "const": "Simple",
          "description": "Discriminator: identifies this as a FreeCategory"
        },
        "name": {
          "type": "string",
          "description": "ID - identifier for the category",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "title": {
          "type": "string",
          "description": "Optional STRING - display title"
        },
        "mandatory": {
          "type": "boolean",
          "description": "Whether this field is mandatory (marked with '*')",
          "default": false
        },
        "numberOfValues": {
          "$ref": "#/definitions/nValues",
          "description": "Optional [nValues] - number of values allowed"
        },
        "type": {
          "$ref": "#/definitions/SimpleType",
          "description": "SimpleType - the data type of this category"
        },
        "max_char": {
          "type": "integer",
          "description": "Optional (INT) - maximum character length"
        },
        "pattern": {
          "type": "string",
          "description": "Optional style(STRING) - display style pattern"
        },
        "initial_value": {
          "type": "string",
          "description": "Optional = [STRING] - initial/default value"
        },
        "sub_categories": {
          "type": "array",
          "description": "Optional nested { Category+ }",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Category"
          }
        }
      }
    },
    "StaticCategory": {
      "type": "object",
      "description": "List name (title)? (mandatory)? ([numberOfValues])? = [ Values, Values+ ]  { sub_categories }?",
      "required": ["category_type", "name", "values"],
      "additionalProperties": false,
      "properties": {
        "category_type": {
          "type": "string",
          "const": "List",
          "description": "Discriminator: identifies this as a StaticCategory"
        },
        "name": {
          "type": "string",
          "description": "ID - identifier for the category",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "title": {
          "type": "string",
          "description": "Optional STRING - display title"
        },
        "mandatory": {
          "type": "boolean",
          "description": "Whether this field is mandatory (marked with '*')",
          "default": false
        },
        "numberOfValues": {
          "$ref": "#/definitions/nValues",
          "description": "Optional [nValues] - number of values allowed"
        },
        "values": {
          "type": "array",
          "description": "= [ Values, Values, ... ] - at least 2 values required",
          "minItems": 2,
          "items": {
            "$ref": "#/definitions/Values"
          }
        },
        "sub_categories": {
          "type": "array",
          "description": "Optional nested { Category+ }",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Category"
          }
        }
      }
    },
    "IndependentDynamicCategory": {
      "type": "object",
      "description": "DynamicList name (title)? (mandatory)? ([numberOfValues])? (reference_name)? = [ initial_values, ... ] { sub_categories }?",
      "required": ["category_type", "name", "initial_values"],
      "additionalProperties": false,
      "properties": {
        "category_type": {
          "type": "string",
          "const": "DynamicList",
          "description": "Discriminator: identifies this as an IndependentDynamicCategory"
        },
        "dynamic_subtype": {
          "type": "string",
          "const": "Independent",
          "description": "Discriminator: distinguishes from DependentDynamicCategory"
        },
        "name": {
          "type": "string",
          "description": "ID - identifier for the category",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "title": {
          "type": "string",
          "description": "Optional STRING - display title"
        },
        "mandatory": {
          "type": "boolean",
          "description": "Whether this field is mandatory (marked with '*')",
          "default": false
        },
        "numberOfValues": {
          "$ref": "#/definitions/nValues",
          "description": "Optional [nValues] - number of values allowed"
        },
        "reference_name": {
          "type": "string",
          "description": "Optional STRING - reference name"
        },
        "initial_values": {
          "type": "array",
          "description": "= [ STRING, ... ] - initial values list",
          "minItems": 1,
          "items": {
            "type": "string"
          }
        },
        "sub_categories": {
          "type": "array",
          "description": "Optional nested { Category+ }",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Category"
          }
        }
      }
    },
    "DependentDynamicCategory": {
      "type": "object",
      "description": "DynamicList name (title)? (mandatory)? ([numberOfValues])? depends_on Category_ref { sub_categories }?",
      "required": ["category_type", "name", "depends_on"],
      "additionalProperties": false,
      "properties": {
        "category_type": {
          "type": "string",
          "const": "DynamicList",
          "description": "Discriminator: identifies this as a DependentDynamicCategory"
        },
        "dynamic_subtype": {
          "type": "string",
          "const": "Dependent",
          "description": "Discriminator: distinguishes from IndependentDynamicCategory"
        },
        "name": {
          "type": "string",
          "description": "ID - identifier for the category",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "title": {
          "type": "string",
          "description": "Optional STRING - display title"
        },
        "mandatory": {
          "type": "boolean",
          "description": "Whether this field is mandatory (marked with '*')",
          "default": false
        },
        "numberOfValues": {
          "$ref": "#/definitions/nValues",
          "description": "Optional [nValues] - number of values allowed"
        },
        "depends_on": {
          "type": "string",
          "description": "Cross-reference to a Category by ID ([Category|ID])",
          "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$"
        },
        "sub_categories": {
          "type": "array",
          "description": "Optional nested { Category+ }",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Category"
          }
        }
      }
    },
    "Note": {
      "type": "object",
      "description": "note - fixed name='note', title='Note', type='string'",
      "required": ["name", "title", "type"],
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": "string",
          "const": "note",
          "description": "Fixed value: 'note'"
        },
        "title": {
          "type": "string",
          "const": "Note",
          "description": "Fixed value: 'Note'"
        },
        "type": {
          "type": "string",
          "const": "string",
          "description": "Fixed value: 'string'"
        }
      }
    },
    "Values": {
      "type": "object",
      "description": "Values wrapper containing a name STRING",
      "required": ["name"],
      "additionalProperties": false,
      "properties": {
        "name": {
          "type": "string",
          "description": "STRING - the value text"
        }
      }
    },
    "SimpleType": {
      "type": "string",
      "description": "Enum: int | text | string | bool | real | date",
      "enum": ["int", "text", "string", "bool", "real", "date"]
    },
    "AssignmentMode": {
      "type": "string",
      "description": "Enum: Normal | Veto | Info",
      "enum": ["Normal", "Veto", "Info"]
    },
    "GraphType": {
      "type": "string",
      "description": "Enum: bar | pie | line",
      "enum": ["bar", "pie", "line"]
    },
    "ConflictResolution": {
      "type": "string",
      "description": "Enum: Majority | Unanimity",
      "enum": ["Majority", "Unanimity"]
    },
    "ConflictType": {
      "type": "string",
      "description": "Enum: Decision (IncludeExclude) | Criteria (ExclusionCriteria)",
      "enum": ["Decision", "Criteria"]
    },
    "Fields": {
      "type": "string",
      "description": "Enum: Title | Abstract | Link | Preview | Bibtex",
      "enum": ["Title", "Abstract", "Link", "Preview", "Bibtex"]
    },
    "DOUBLE": {
      "description": "DOUBLE: INT ('.' INT)? - a decimal number",
      "oneOf": [
        {
          "type": "number"
        },
        {
          "type": "string",
          "pattern": "^[0-9]+(\\.[0-9]+)?$"
        }
      ]
    },
    "nValues": {
      "description": "nValues: '-1' | INT - number of values (-1 means unlimited)",
      "oneOf": [
        {
          "type": "integer",
          "const": -1,
          "description": "-1 means unlimited/variable number of values"
        },
        {
          "type": "integer",
          "minimum": 0,
          "description": "INT - specific number of values"
        }
      ]
    }
  }
}