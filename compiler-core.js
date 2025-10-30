// EBPL Compiler Core - Pure JavaScript Version
class EBPLCompiler {
    constructor() {
        this.tokens = [];
        this.ast = null;
        this.errors = [];
        this.generatedCode = '';
    }

    compile(sourceCode) {
        this.errors = [];
        try {
            // Lexical Analysis
            const lexer = new Lexer(sourceCode);
            this.tokens = lexer.tokenize();
            
            // Syntax Analysis
            const parser = new Parser(this.tokens);
            this.ast = parser.parse();
            
            // Code Generation
            this.generatedCode = this.generatePython();
            
            // Simulate execution
            const executionResult = this.simulateExecution(this.generatedCode);
            
            return {
                success: true,
                tokens: this.getTokensDisplay(),
                generatedCode: this.generatedCode,
                executionOutput: executionResult.output,
                executionError: executionResult.error
            };
        } catch (error) {
            this.errors.push(error.message);
            return {
                success: false,
                error: error.message,
                errors: this.errors
            };
        }
    }

    generatePython() {
        if (!this.ast) return '';
        
        const lines = [
            "#!/usr/bin/env python3",
            "# Generated from EBPL",
            ""
        ];
        
        for (const statement of this.ast.statements) {
            const code = this.generateStatement(statement);
            if (code) {
                lines.push(code);
            }
        }
        
        return lines.join('\n');
    }

    generateStatement(node, indent = 0) {
        const indentStr = '    '.repeat(indent);
        
        if (node instanceof VariableDeclaration) {
            const valueCode = this.generateExpression(node.value);
            return `${indentStr}${node.identifier} = ${valueCode}`;
        }
        
        if (node instanceof PrintStatement) {
            const valueCode = this.generateExpression(node.expression);
            return `${indentStr}print(${valueCode})`;
        }
        
        return `${indentStr}# Unknown statement`;
    }

    generateExpression(node) {
        if (node instanceof NumberLiteral) {
            return node.value.toString();
        }
        
        if (node instanceof StringLiteral) {
            return `"${node.value}"`;
        }
        
        if (node instanceof Identifier) {
            return node.name;
        }
        
        if (node instanceof BinaryOperation) {
            const left = this.generateExpression(node.left);
            const right = this.generateExpression(node.right);
            return `(${left} ${node.operator} ${right})`;
        }
        
        return 'None';
    }

    simulateExecution(pythonCode) {
        try {
            // Simple simulation for demo
            const lines = pythonCode.split('\n');
            const output = [];
            const variables = {};
            
            for (const line of lines) {
                const trimmed = line.trim();
                
                // Skip comments and empty lines
                if (!trimmed || trimmed.startsWith('#')) continue;
                
                // Handle variable assignment
                if (trimmed.includes('=')) {
                    const [varName, expression] = trimmed.split('=').map(s => s.trim());
                    if (expression) {
                        // Simple evaluation (for demo)
                        let value = expression;
                        
                        // Remove parentheses for simple expressions
                        value = value.replace(/[()]/g, '');
                        
                        // Basic arithmetic evaluation
                        if (value.includes('+')) {
                            const parts = value.split('+').map(p => p.trim());
                            const num1 = parseFloat(parts[0]) || variables[parts[0]] || 0;
                            const num2 = parseFloat(parts[1]) || variables[parts[1]] || 0;
                            value = num1 + num2;
                        } else if (value.includes('-')) {
                            const parts = value.split('-').map(p => p.trim());
                            const num1 = parseFloat(parts[0]) || variables[parts[0]] || 0;
                            const num2 = parseFloat(parts[1]) || variables[parts[1]] || 0;
                            value = num1 - num2;
                        } else if (value.includes('*')) {
                            const parts = value.split('*').map(p => p.trim());
                            const num1 = parseFloat(parts[0]) || variables[parts[0]] || 1;
                            const num2 = parseFloat(parts[1]) || variables[parts[1]] || 1;
                            value = num1 * num2;
                        } else if (value.includes('/')) {
                            const parts = value.split('/').map(p => p.trim());
                            const num1 = parseFloat(parts[0]) || variables[parts[0]] || 0;
                            const num2 = parseFloat(parts[1]) || variables[parts[1]] || 1;
                            value = num2 !== 0 ? num1 / num2 : 0;
                        } else if (!isNaN(value)) {
                            value = parseFloat(value);
                        } else if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1);
                        }
                        
                        variables[varName] = value;
                    }
                }
                
                // Handle print statements
                if (trimmed.startsWith('print(')) {
                    let content = trimmed.substring(6, trimmed.length - 1).trim();
                    
                    // Handle variables in print
                    if (variables[content] !== undefined) {
                        output.push(variables[content].toString());
                    } else if (content.startsWith('"') && content.endsWith('"')) {
                        output.push(content.slice(1, -1));
                    } else {
                        output.push(content);
                    }
                }
            }
            
            return {
                output: output.join('\n'),
                error: ''
            };
        } catch (error) {
            return {
                output: '',
                error: 'Simulation error: ' + error.message
            };
        }
    }

    getTokensDisplay() {
        return this.tokens
            .filter(token => token.type !== 'NEWLINE' && token.type !== 'EOF')
            .map(token => `${token.type.padEnd(20)} -> '${token.value}' (line ${token.line})`);
    }
}

// Token Types
const TokenType = {
    CREATE: 'CREATE',
    VARIABLE: 'VARIABLE',
    WITH: 'WITH',
    VALUE: 'VALUE',
    PRINT: 'PRINT',
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    MULTIPLY: 'MULTIPLY',
    DIVIDE: 'DIVIDE',
    NEWLINE: 'NEWLINE',
    EOF: 'EOF'
};

// Lexer
class Lexer {
    constructor(sourceCode) {
        this.sourceCode = sourceCode;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
    }

    tokenize() {
        const lines = this.sourceCode.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const words = line.split(/\s+/);
            let j = 0;
            
            while (j < words.length) {
                const word = words[j];
                
                if (word === 'create' && words[j+1] === 'variable') {
                    this.tokens.push(new Token(TokenType.CREATE, 'create', this.line, this.column));
                    this.tokens.push(new Token(TokenType.VARIABLE, 'variable', this.line, this.column + 7));
                    j += 2;
                    
                    // Get variable name
                    const varName = words[j];
                    this.tokens.push(new Token(TokenType.IDENTIFIER, varName, this.line, this.column));
                    j++;
                    
                    // Expect 'with value'
                    if (words[j] === 'with' && words[j+1] === 'value') {
                        this.tokens.push(new Token(TokenType.WITH, 'with', this.line, this.column));
                        this.tokens.push(new Token(TokenType.VALUE, 'value', this.line, this.column + 5));
                        j += 2;
                        
                        // Get the value (could be multiple words)
                        let valueParts = [];
                        while (j < words.length && words[j] !== 'print' && !words[j].startsWith('print')) {
                            valueParts.push(words[j]);
                            j++;
                        }
                        
                        const value = valueParts.join(' ');
                        if (value.startsWith('"') && value.endsWith('"')) {
                            this.tokens.push(new Token(TokenType.STRING, value.slice(1, -1), this.line, this.column));
                        } else if (!isNaN(value)) {
                            this.tokens.push(new Token(TokenType.NUMBER, value, this.line, this.column));
                        } else {
                            // Handle expressions
                            this.parseExpression(value);
                        }
                    }
                } else if (word === 'print') {
                    this.tokens.push(new Token(TokenType.PRINT, 'print', this.line, this.column));
                    j++;
                    
                    // Get print content
                    let printParts = [];
                    while (j < words.length) {
                        printParts.push(words[j]);
                        j++;
                    }
                    
                    const content = printParts.join(' ');
                    if (content.startsWith('"') && content.endsWith('"')) {
                        this.tokens.push(new Token(TokenType.STRING, content.slice(1, -1), this.line, this.column));
                    } else {
                        this.parseExpression(content);
                    }
                } else {
                    j++;
                }
            }
            
            this.tokens.push(new Token(TokenType.NEWLINE, '\n', this.line, this.column));
            this.line++;
        }
        
        this.tokens.push(new Token(TokenType.EOF, '', this.line, this.column));
        return this.tokens;
    }

    parseExpression(expression) {
        // Simple expression parsing for demo
        const parts = expression.split(/(\+|\-|\*|\/)/);
        
        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            
            if (trimmed === '+') {
                this.tokens.push(new Token(TokenType.PLUS, '+', this.line, this.column));
            } else if (trimmed === '-') {
                this.tokens.push(new Token(TokenType.MINUS, '-', this.line, this.column));
            } else if (trimmed === '*') {
                this.tokens.push(new Token(TokenType.MULTIPLY, '*', this.line, this.column));
            } else if (trimmed === '/') {
                this.tokens.push(new Token(TokenType.DIVIDE, '/', this.line, this.column));
            } else if (!isNaN(trimmed)) {
                this.tokens.push(new Token(TokenType.NUMBER, trimmed, this.line, this.column));
            } else {
                this.tokens.push(new Token(TokenType.IDENTIFIER, trimmed, this.line, this.column));
            }
        }
    }
}

// Parser and AST classes
class Token {
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    parse() {
        const statements = [];
        
        while (this.position < this.tokens.length) {
            const token = this.tokens[this.position];
            
            if (token.type === TokenType.CREATE) {
                statements.push(this.parseVariableDeclaration());
            } else if (token.type === TokenType.PRINT) {
                statements.push(this.parsePrintStatement());
            } else if (token.type === TokenType.NEWLINE || token.type === TokenType.EOF) {
                this.position++;
            } else {
                throw new Error(`Unexpected token: ${token.type}`);
            }
        }
        
        return new Program(statements);
    }

    parseVariableDeclaration() {
        // create variable identifier with value expression
        this.expect(TokenType.CREATE);
        this.expect(TokenType.VARIABLE);
        const identifier = this.expect(TokenType.IDENTIFIER);
        this.expect(TokenType.WITH);
        this.expect(TokenType.VALUE);
        const value = this.parseExpression();
        
        return new VariableDeclaration(identifier.value, value);
    }

    parsePrintStatement() {
        this.expect(TokenType.PRINT);
        const expression = this.parseExpression();
        return new PrintStatement(expression);
    }

    parseExpression() {
        let left = this.parsePrimary();
        
        while (this.position < this.tokens.length) {
            const token = this.tokens[this.position];
            
            if (token.type === TokenType.PLUS || token.type === TokenType.MINUS || 
                token.type === TokenType.MULTIPLY || token.type === TokenType.DIVIDE) {
                this.position++;
                const right = this.parsePrimary();
                left = new BinaryOperation(left, token.value, right);
            } else {
                break;
            }
        }
        
        return left;
    }

    parsePrimary() {
        const token = this.tokens[this.position];
        
        if (token.type === TokenType.NUMBER) {
            this.position++;
            return new NumberLiteral(parseFloat(token.value));
        } else if (token.type === TokenType.STRING) {
            this.position++;
            return new StringLiteral(token.value);
        } else if (token.type === TokenType.IDENTIFIER) {
            this.position++;
            return new Identifier(token.value);
        } else {
            throw new Error(`Unexpected token in expression: ${token.type}`);
        }
    }

    expect(expectedType) {
        const token = this.tokens[this.position];
        if (token.type === expectedType) {
            this.position++;
            return token;
        } else {
            throw new Error(`Expected ${expectedType}, got ${token.type}`);
        }
    }
}

// AST Nodes
class Program {
    constructor(statements) {
        this.statements = statements;
    }
}

class VariableDeclaration {
    constructor(identifier, value) {
        this.identifier = identifier;
        this.value = value;
    }
}

class PrintStatement {
    constructor(expression) {
        this.expression = expression;
    }
}

class NumberLiteral {
    constructor(value) {
        this.value = value;
    }
}

class StringLiteral {
    constructor(value) {
        this.value = value;
    }
}

class Identifier {
    constructor(name) {
        this.name = name;
    }
}

class BinaryOperation {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}