import sympy as sp
from sympy.parsing.latex import parse_latex
import re


def solve_common_latex_problem(latex_input):  
    try:
        # Try parsing the LaTeX input
        try:
            expr = parse_latex(latex_input)
        except Exception as e:
            print("Error parsing LaTeX expression:", str(e))
            return
        
        # Handle equations
        if isinstance(expr, sp.Equality):
            try:
                solution = sp.solve(expr)
                if solution:
                    print("Solution:", solution)
                    # display(Math(sp.latex(solution)))
                else:
                    print("No solution found.")
            except Exception as e:
                print("Error solving equation:", str(e))

        # Handle differentiation
        elif isinstance(expr, sp.Derivative):
            try:
                print("Differentiation Detected.")
                derivative = expr.doit()
                print("Result:", derivative)
            except Exception as e:
                print("Error computing derivative:", str(e))
            return

        # Handle integrartion
        elif isinstance(expr, sp.Integral):
            try:
                print("Integration Detected.")
                integrated = expr.doit()  # Try symbolic evaluation
                if integrated.has(sp.Integral):  # Check if it's still an unevaluated integral
                    numerical_result = sp.N(expr)  # Compute numerically as fallback
                    print("Numerical Approximation:", numerical_result)
                    # display(Math(sp.latex(numerical_result)))
                else:
                    print("Integration Result:", integrated)
                    # display(Math(sp.latex(integrated)))
            except Exception as e:
                print("Error computing integral:", str(e))
            return


        # Check if the expression contains symbols (variables)
        elif expr.has(sp.Symbol):
            try:
                print("Expression with Symbols Detected.")
                unknowns = list(expr.free_symbols)
                if len(unknowns) == 1:
                    # Solve for the single unknown like x^2 - 4
                    solution = sp.solve(expr, unknowns[0])
                    if solution:
                        print(f"Solution for {unknowns[0]}:", solution)
                        # display(Math(sp.latex(solution)))
                    else:
                        print("No solution found.")
                else:
                    # try solving for multiple symbols like 12x + 3y -4
                    simplified = sp.simplify(expr)
                    print("Simplified Expression:", simplified)
                    # display(Math(sp.latex(simplified)))
            except Exception as e:
                print("Error solving/simplifying expression:", str(e))
            return  

        # Simplify or evaluate
        else:
            try:
                print("Simplification Expression Detected (No Symbols).")
                simplified = sp.simplify(expr)
                print("Simplified Expression:", simplified)
                # display(Math(sp.latex(simplified)))
            except Exception as e:
                print("Error simplifying expression:", str(e))
            return 

    except Exception as e:
        print("An unexpected error occurred:", str(e))

if __name__ == "__main__":
    print("Enter a mathematical problem in LaTeX format.")
    print("Examples:")
    print("- Equation: $x^2 - 4 = 0$")
    print("- Derivative: $\\frac{d}{dx}x^3$")
    print("- Integral: $\\int x^2 \\, dx$")
    latex_input = input("LaTeX Input: ")
    solve_common_latex_problem(latex_input)
