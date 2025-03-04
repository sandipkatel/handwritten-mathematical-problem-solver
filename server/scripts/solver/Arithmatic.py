import sympy as sp

def solve_arithmetic_simplification(expr):  
    """
    Solve arithmetic simplification problems and return LaTeX representation.
    
    Args:
        expr: SymPy expression
    
    Returns:
        dict: A dictionary containing the original and simplified LaTeX expressions
    """
    try:
        # Simplify the expression
        simplified = sp.simplify(expr)
        
        # Convert both original and simplified expressions to LaTeX
        original_latex = sp.latex(expr)
        simplified_latex = sp.latex(simplified)
        
        # Return a dictionary with LaTeX representations
        return {
            "original": original_latex,
            "simplified": simplified_latex
        }
    except Exception as e:
        # Return error information in a structured way
        return {
            "Error solving simplification problem": str(e)
        }