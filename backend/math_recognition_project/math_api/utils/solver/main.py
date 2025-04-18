import sympy as sp
import sys
from sympy.parsing.latex import parse_latex
from Algebra import solve_algebra, is_system_of_linear_equations, solve_system_of_equations
from Matrix import solve_matrix
from Calculus import solve_calculus
from Arithmatic import solve_arithmetic_simplification
# from SolveCommon import solve_common_math_problem

def solve(latex_input):
    
    """
    Comprehensive main function to solve Matrix, System of Linear equations, Polynomials, calculus and simplification.
    
    Args:
        latex_input: A string containing LaTeX expression, or a SymPy expression
    
    Returns:
        The result of the solution or exception
    """
    try:
        try:
            expr = parse_latex(latex_input)
        except Exception as e:
            print("Error parsing LaTeX expression:", str(e))
            return {
            "Error parsing LaTeX expression:": str(e)
            }

        # Handle Matrices
        if r"\begin{bmatrix}" in latex_input:
            return solve_matrix(latex_input)
        # Handle System of Linear Equations
        elif is_system_of_linear_equations(latex_input):
            print("System of Linear Equations Detected")
            print(latex_input)
            return solve_system_of_equations(latex_input)
        # Handle Calculus
        elif isinstance(expr, sp.Derivative) or isinstance(expr, sp.Integral):
            return solve_calculus(latex_input)
        # Handle Polynomials
        elif isinstance(expr, sp.Equality) or expr.has(sp.Symbol):
            return solve_algebra(latex_input)
        # Handle Arithmatic Simplification
        else:
            return solve_arithmetic_simplification(expr)
    except Exception as e:
        print("An unexpected error occurred:", str(e))
        return {
            "An unexpected error occurred:": str(e)
        }


# if __name__ == "__main__":
#     print("Enter a mathematical problem in LaTeX format.")
#     print("Examples:")
#     print("- Equation: $x^2 - 4 = 0$")
#     print("- Derivative: $\\frac{d}{dx}x^3$")
#     print("- Integral: $\\int x^2 \\, dx$")
#     latex_input = input("LaTeX Input: ")
#     print(main(latex_input))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # When called from Node.js with an argument
        latex_input = sys.argv[1]
        solve(latex_input)
    else:
        latex_input = input("LaTeX Input: ")
        print(solve(latex_input))