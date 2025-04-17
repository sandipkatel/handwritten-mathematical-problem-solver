# math_api/utils/solve.py

import sympy as sp
from sympy.parsing.latex import parse_latex

def solve_common_latex_problem(latex_input):
    try:
        expr = parse_latex(latex_input)
    except Exception as e:
        return {"error": f"LaTeX parsing error: {str(e)}"}

    try:
        if isinstance(expr, sp.Equality):
            try:
                solution = sp.solve(expr)
                if solution:
                    return {"solution": sp.latex(solution)}
                else:
                    return {"error": "No solution found."}
            except Exception as e:
                return {"error": f"Error solving equation: {str(e)}"}

        elif isinstance(expr, sp.Derivative):
            try:
                derivative = expr.doit()
                return {"solution": sp.latex(derivative)}
            except Exception as e:
                return {"error": f"Error computing derivative: {str(e)}"}

        elif isinstance(expr, sp.Integral):
            try:
                integrated = expr.doit()
                if integrated.has(sp.Integral):
                    numerical_result = sp.N(expr)
                    return {"solution": sp.latex(numerical_result)}
                else:
                    return {"solution": sp.latex(integrated)}
            except Exception as e:
                return {"error": f"Error computing integral: {str(e)}"}

        elif expr.has(sp.Symbol):
            try:
                unknowns = list(expr.free_symbols)
                if len(unknowns) == 1:
                    solution = sp.solve(expr, unknowns[0])
                    if solution:
                        return {"solution": sp.latex(solution)}
                    else:
                        return {"error": "No solution found."}
                else:
                    simplified = sp.simplify(expr)
                    return {"solution": sp.latex(simplified)}
            except Exception as e:
                return {"error": f"Error simplifying expression: {str(e)}"}

        else:
            try:
                simplified = sp.simplify(expr)
                return {"solution": sp.latex(simplified)}
            except Exception as e:
                return {"error": f"Error simplifying expression: {str(e)}"}

    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}
