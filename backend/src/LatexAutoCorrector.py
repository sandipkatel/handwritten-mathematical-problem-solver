import re
import sympy
from sympy.parsing.latex import parse_latex
from difflib import get_close_matches
import logging

class LaTeXCorrector:
    """
    A class to perform post-processing corrections on LaTeX expressions 
    recognized from handwritten mathematical inputs, with specific focus on:
    1. Missing powers/exponents
    2. Differentiation notation issues
    3. Unclosed brackets
    """
    
    def __init__(self):
        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("LaTeX Corrector")
        
        # Common error patterns and their corrections
        self.common_errors = {
            # Symbol substitutions
            r'\\times': r'\\times',
            r'\\div': r'\\div',
            r'0': 'O',  # Digit 0 vs letter O confusion
            r'l': r'1',  # letter l vs number 1 confusion
            
            # Structural errors
            r'(?<![\\])\{([^{}]*)\}': r'{\\{}}',  # Unescaped braces
            r'\\sqrt\[(\d+)\]': r'\\sqrt[\1]',  # Fix root expressions
            
            # Bracket balancing errors
            r'\(([^()]*$)': r'(\1)',  # Missing closing parenthesis
            r'([^()]*)\)': r'(\1)',   # Missing opening parenthesis
            r'\{([^{}]*$)': r'{\1}',  # Missing closing brace
            r'([^{}]*)\}': r'{\1}',   # Missing opening brace
            
            # Fraction fixes
            r'\\frac([a-zA-Z0-9])([a-zA-Z0-9])': r'\\frac{\1}{\2}',  # Missing braces in fractions
            
            # Superscript and subscript fixes
            r'\^([a-zA-Z0-9])': r'^{\1}',  # Missing braces in superscripts
            r'\_([a-zA-Z0-9])': r'_{\1}',  # Missing braces in subscripts
        }
        
        # Commonly confused symbols
        self.symbol_replacements = {
            r'\\alpha': ['d', 'a'],  # alpha often confused with 'd' or 'a'
            r't x': ['dx'],  # 'tx' often confused with 'dx' in derivatives
            r'X': ['x'],     # Capital X often confused with lowercase x
            r'D': ['d'],     # Capital D often confused with lowercase d
            r'\\partial': ['d'], # partial sometimes confused with d
        }
        
        # Terms that should have powers but commonly miss the ^ notation
        self.power_regex = re.compile(r'(\d+)([a-zA-zA-Z])(\d+)')
    
    def detect_and_fix_powers(self, latex_expr):
        """
        Detect patterns like '3x2' and convert to '3x^{2}'
        Also fixes cases where variables are adjacent to numbers
        """
        # Fix patterns like 3x2 -> 3x^{2}
        def power_replacement(match):
            coefficient = match.group(1)
            variable = match.group(2)
            exponent = match.group(3)
            return f"{coefficient}{variable}^{{{exponent}}}"
        
        corrected = self.power_regex.sub(power_replacement, latex_expr)
        
        # Also check for isolated cases like x2 at word boundaries
        corrected = re.sub(r'\b([a-zA-Z])(\d+)\b', r'\1^{\2}', corrected)
        
        return corrected
    
    def fix_differentiation_notation(self, latex_expr):
        """
        Fix common issues with differentiation notation:
        1. Replace '\frac{d}{tx}' with '\frac{d}{dx}'
        2. Fix alpha/d confusion
        3. Handle other common derivative notation issues
        """
        # Fix common differentiation patterns
        corrected = latex_expr
        
        # Fix \frac{d}{tx} -> \frac{d}{dx} pattern
        corrected = re.sub(r'\\frac\s*\{\s*d\s*\}\s*\{\s*t\s*x\s*\}', r'\\frac{d}{dx}', corrected)
        corrected = re.sub(r'\\frac\s*\{\s*d\s*\}\s*\{\s*t\s*\}', r'\\frac{d}{dt}', corrected)
        
        # Fix \alpha confusion in derivatives
        corrected = re.sub(r'\\frac\s*\{\s*\\alpha\s*\}', r'\\frac{d}', corrected)
        
        # Fix common variable confusions in differentiation
        for wrong, replacements in self.symbol_replacements.items():
            for replacement in replacements:
                # Only in the context of fractions that look like derivatives
                pattern = f"\\frac\\s*{{\\s*d\\s*}}\\s*{{\\s*{wrong}\\s*}}"
                corrected = re.sub(pattern, f"\\frac{{d}}{{{replacement}}}", corrected)
        
        # Ensure proper structure for derivatives of powers
        corrected = re.sub(r'\\frac\s*\{\s*d\s*\}\s*\{\s*d([a-zA-Z])\s*\}\s*\(\s*([a-zA-Z])\s*\^\s*\{\s*([a-zA-Z0-9]+)\s*\}\s*\)', 
                          r'\\frac{d}{d\1}(\2^{\3})', corrected)
        
        return corrected
    
    def balance_all_brackets(self, latex_expr):
        """
        Ensure all types of brackets are properly balanced:
        - Parentheses ()
        - Square brackets []
        - Curly braces {}
        - LaTeX \left and \right pairs
        """
        # First handle the LaTeX curly braces that define argument groups
        stack = []
        latex_chars = list(latex_expr)
        
        # First pass: Basic balancing of {}, [], and ()
        for i, char in enumerate(latex_chars):
            if char in '({[':
                stack.append((char, i))
            elif char in ')}]':
                opening_map = {')': '(', '}': '{', ']': '['}
                if stack and stack[-1][0] == opening_map.get(char):
                    stack.pop()
                else:
                    # Missing opening bracket - insert at beginning
                    latex_chars.insert(0, opening_map.get(char, '('))
        
        # Add missing closing brackets at the end
        closing_map = {'(': ')', '{': '}', '[': ']'}
        for bracket, _ in reversed(stack):
            latex_chars.append(closing_map.get(bracket, ')'))
        
        # Handle \left and \right pairs
        corrected = ''.join(latex_chars)
        left_commands = re.findall(r'\\left[\(\[\{\|]', corrected)
        right_commands = re.findall(r'\\right[\)\]\}\|]', corrected)
        
        # If unbalanced \left and \right commands
        if len(left_commands) > len(right_commands):
            for _ in range(len(left_commands) - len(right_commands)):
                corrected += r'\right)'
        elif len(right_commands) > len(left_commands):
            for _ in range(len(right_commands) - len(left_commands)):
                corrected = r'\left(' + corrected
        
        return corrected
    
    def fix_frac_notation(self, latex_expr):
        """Fix common issues with fraction notation."""
        corrected = latex_expr
        
        # Ensure \frac has proper braces
        corrected = re.sub(r'\\frac([^{])', r'\\frac{\1}', corrected)
        
        # Fix cases where \frac has only one argument
        frac_pattern = r'\\frac\s*\{([^{}]*)\}\s*(?!\{)'
        for match in re.finditer(frac_pattern, corrected):
            pos = match.end()
            corrected = corrected[:pos] + '{1}' + corrected[pos:]
        
        # Fix nested fractions with missing braces
        corrected = re.sub(r'\\frac\{([^{}]*)\}\{\\frac([^{}]*)\}', r'\\frac{\1}{\\frac{\2}}', corrected)
        
        return corrected
    
    def validate_expression(self, latex_expr):
        """Basic validation to see if the expression is likely valid."""
        try:
            # Try to parse with sympy
            expr = parse_latex(latex_expr)
            return True
        except Exception:
            return False
    
    def correct_latex(self, latex_expr):
        """Apply all correction methods to the LaTeX expression."""
        self.logger.info(f"Original: {latex_expr}")
        
        # Apply specific fixes for the mentioned issues
        latex_expr = self.detect_and_fix_powers(latex_expr)
        self.logger.info(f"After power fixes: {latex_expr}")
        
        latex_expr = self.fix_differentiation_notation(latex_expr)
        self.logger.info(f"After differentiation fixes: {latex_expr}")
        
        latex_expr = self.fix_frac_notation(latex_expr)
        self.logger.info(f"After fraction fixes: {latex_expr}")
        
        latex_expr = self.balance_all_brackets(latex_expr)
        self.logger.info(f"After bracket balancing: {latex_expr}")
        
        # Apply any remaining common fixes
        for pattern, replacement in self.common_errors.items():
            latex_expr = re.sub(pattern, replacement, latex_expr)
        
        is_valid = self.validate_expression(latex_expr)
        
        return latex_expr, is_valid


# Example usage
if __name__ == "__main__":
    corrector = LaTeXCorrector()
    
    # Test cases focusing on the specific issues mentioned
    test_cases = [
        # Power recognition issues
        "3x2 + 5y3 - z4",  # Should be 3x^{2} + 5y^{3} - z^{4}
        "x2y3 + 5z",       # Should be x^{2}y^{3} + 5z
        
        # Differentiation issues
        r"\frac { d } { t x } ( x ^ { X } )",  # Should be \frac{d}{dx}(x^{x})
        r"\frac { \alpha } { dx } sin(x)",      # Should be \frac{d}{dx}sin(x)
        r"\frac{d}{dX}(X^2)",                   # Should be \frac{d}{dx}(x^2)
        
        # Bracket closing issues
        r"\left( x^2 + y^2",                    # Missing \right)
        r"f(x) = \{ x | x > 0",                 # Missing closing brace
        r"\frac{1}{1+\frac{1}{2}",              # Missing closing brace in nested fraction
        
        # Combined issues
        r"\frac { d } { t x } ( x2 + y3",       # Multiple issues
        r"\frac{1}{2 \times \frac{3}{4}",       # Nested fractions with missing bracket
    ]
    
    for i, test in enumerate(test_cases):
        print(f"\n===== Test Case {i+1} =====")
        corrected, is_valid = corrector.correct_latex(test)
        print(f"Original:  {test}")
        print(f"Corrected: {corrected}")
        print(f"Valid: {'Yes' if is_valid else 'No'}")