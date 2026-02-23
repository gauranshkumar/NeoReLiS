Below is the xtext grammar of dsl

grammar org.xtext.language.relis.Relis with org.eclipse.xtext.common.Terminals

generate reread "http://www.xtext.org/language/relis/Relis"

Model:
    elements+=Project
;

Project:
    'PROJECT' short_name=ID name=STRING
    (
        'SCREENING' screening=Screening?
        (
            'QA' quality_assess=QA
        )?
        'DATA EXTRACTION' (category+=Category)+
        (
            'SYNTHESIS' (reporting+=Report)*
        )?
    )
;

Screening:
    'Reviews' review_per_paper=INT
    'Conflict' (
        'we' conflict_type=ConflictType
    ) (
        'resolved_by' conflict_resolution=ConflictResolution
    )
    'Criteria' '=' '[' exclusion_criteria+=Values (',' exclusion_criteria+=Values)* ']'
    (
        'Sources' '=' '[' source_papers+=Values (',' source_papers+=Values)* ']'
    )?
    (
        'Strategies' '=' '[' search_strategy+=Values (',' search_strategy+=Values)* ']'
    )?
    (
        'Validation' validation_percentage=INT '%' 
        (
            validation_assignment_mode=AssignmentMode
        )?
    )?
    (
        'Phases' '(' phases+=Phase (',' phases+=Phase)* ')'
    )?
;

QA:
    'Questions' '=' '[' question+=STRING (',' question+=STRING)* ']'
    'Answers' '=' '[' response+=Response (',' response+=Response)* ']'
    'Min_score' min_score=DOUBLE
;

Response:
    title=STRING ':' score=DOUBLE
;

Report:
    SimpleGraph | CompareGraph
;

SimpleGraph:
    'Simple' name=ID (title=STRING)? 'we' value=[Category|ID]
    ('charts(' chart+=GraphType (',' chart+=GraphType)* ')')
;

CompareGraph:
    'Compared' name=ID (title=STRING)? 'we' value=[Category|ID]
    'with' reference=[Category|ID]
    ('charts(' chart+=GraphType (',' chart+=GraphType)* ')')
;

Phase:
    title=STRING (description=STRING)?
    ('Fields' '(' fields+=Fields (',' fields+=Fields)* ')')?
;

Category:
    FreeCategory | StaticCategory | IndependentDynamicCategory | DependentDynamicCategory
;

FreeCategory:
    'Simple' name=ID (title=STRING)? (mandatory?='*')?
    ('[' numberOfValues=nValues ']')? ':' type=SimpleType 
    ('(' max_char=INT ')')? 
    ('style(' pattern=STRING ')')? 
    ('=' '[' initial_value=STRING ']')?
    (
        '{' sub_categories+=Category+ '}'
    )?
;

StaticCategory:
    'List' name=ID (title=STRING)? (mandatory?='*')?
    ('[' numberOfValues=nValues ']')?
    '=' '[' values+=Values (',' values+=Values)+ ']'
    (
        '{' sub_categories+=Category+ '}'
    )?
;

IndependentDynamicCategory:
    'DynamicList' name=ID (title=STRING)? (mandatory?='*')?
    ('[' numberOfValues=nValues ']')?
    (reference_name=STRING)?
    '=' '[' initial_values+=STRING (',' initial_values+=STRING)* ']'
    (
        '{' sub_categories+=Category+ '}'
    )?
;

DependentDynamicCategory:
    'DynamicList' name=ID (title=STRING)? (mandatory?='*')?
    ('[' numberOfValues=nValues ']')?
    'depends_on' depends_on=[Category|ID]
    (
        '{' sub_categories+=Category+ '}'
    )?
;

Note:
    'note' name='note' title='Note' type='string'
;

Values:
    name=STRING
;

enum SimpleType:
    int='int' | text='text' | string='string' | bool='bool' | real='real' | date='date'
;

enum AssignmentMode:
    Normal='Normal' | Veto='Veto' | Info='Info'
;

enum GraphType:
    bar='bar' | pie='pie' | line='line'
;

enum ConflictResolution:
    Majority='Majority' | Unanimity='Unanimity'
;

enum ConflictType:
    IncludeExclude='Decision' | ExclusionCriteria='Criteria'
;

enum Fields:
    Title='Title' | Abstract='Abstract' | Link='Link' | Preview='Preview' | Bibtex='Bibtex'
;

DOUBLE:
    INT ('.' INT)?
;

nValues:
    '-1' | INT
;