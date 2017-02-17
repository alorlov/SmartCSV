'use babel'

class Expression {
  constructor () {}
  interpret ({}) {}
}

class Number extends Expression {
    constructor (number) { super(); this.number = number; }
    interpret (variables) { return this.number; }
}

class Plus extends Expression {
    constructor (left, right) {
      super()
      this.leftOperand = left;
      this.rightOperand = right;
    }

    interpret(variables) {
        return this.leftOperand.interpret(variables) + this.rightOperand.interpret(variables);
    }
}

class Minus extends Expression {
    constructor (left, right) {
      super()
      this.leftOperand = left;
      this.rightOperand = right;
    }

    interpret(variables) {
        return this.leftOperand.interpret(variables) - this.rightOperand.interpret(variables);
    }
}

class Variable extends Expression {
    constructor (name) {
      super();
      this.name = name;
    }

    interpret(variables) {
        if (null == variables.get(this.name)) return 0; // Either return new Number(0).
        return variables.get(this.name).interpret(variables);
    }
}

class Evaluator extends Expression {
    constructor(expression) {
        super()
        this.syntaxTree = {}
        this.expressionStack = [];
        for (token of expression.split(" ")) {
            if (token == "+") {
                const subExpression = new Plus(this.expressionStack.pop(), this.expressionStack.pop());
                this.expressionStack.push(subExpression);
            } else if (token == "-") {
                // it's necessary remove first the right operand from the stack
                right = this.expressionStack.pop();
                // ..and after the left one
                left = this.expressionStack.pop();
                const subExpression = new Minus(left, right);
                this.expressionStack.push(subExpression);
            } else
                this.expressionStack.push(new Variable(token));
        }
        console.log(this.expressionStack)
        this.syntaxTree = this.expressionStack.pop();
    }

    interpret(context) {
        return this.syntaxTree.interpret(context);
    }
}

module.exports = {Evaluator, Number}
