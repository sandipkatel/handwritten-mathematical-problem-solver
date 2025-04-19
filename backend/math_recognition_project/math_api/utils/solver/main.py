import sympy as sp
import sys
import os
from sympy.parsing.latex import parse_latex
from .Algebra import solve_algebra, is_system_of_linear_equations, solve_system_of_equations
from .Matrix import solve_matrix
from .Calculus import solve_calculus
from .Arithmatic import solve_arithmetic_simplification
from django.conf import settings
# from SolveCommon import solve_common_math_problem


def solve(latex_input):
    try:
        try:
            expr = parse_latex(latex_input)
        except Exception as e:
            return {"error": f"Error parsing LaTeX expression: {str(e)}"}

        # Define the correct path for the plot file
        plot_dir = os.path.join(settings.BASE_DIR, 'math_api', 'image')
        plot_file = os.path.join(plot_dir, 'result.png')

        # Make sure the directory exists
        os.makedirs(plot_dir, exist_ok=True)

        # Clear any existing plot file before solving
        if os.path.exists(plot_file):
            try:
                os.remove(plot_file)
            except OSError:
                pass

        # Matrix
        if r"\begin{bmatrix}" in latex_input:
            result = solve_matrix(latex_input)
        # System of Linear Equations
        elif is_system_of_linear_equations(latex_input):
            try:
                equations = [parse_latex(eq.strip()) for eq in latex_input.split(",")]
            except:
                equations = [sp.sympify(eq.strip()) for eq in latex_input.split(",")]
            result = solve_system_of_equations(equations)

        # Calculus (Derivative or Integral)
        elif isinstance(expr, sp.Derivative) or isinstance(expr, sp.Integral):
            result = solve_calculus(latex_input)
        # Algebra
        elif isinstance(expr, sp.Equality) or expr.has(sp.Symbol):
            result = solve_algebra(latex_input)
        # Arithmetic
        else:
            result = solve_arithmetic_simplification(expr)

        # Check if a new graph was generated during this solving process
        if os.path.exists(plot_file):
            result["plot_url"] = "get_plot/"
        print("Result:",result)
        return result

    except Exception as e:
        return {"error": f"Unexpected error occurred: {str(e)}"}


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # When called from Node.js with an argument
        latex_input = sys.argv[1]
        solve(latex_input)
    else:
        latex_input = input("LaTeX Input: ")
        print(solve(latex_input))
