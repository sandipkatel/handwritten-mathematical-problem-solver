import sympy as sp
import numpy as np
import matplotlib.pyplot as plt
from IPython.display import Math, display
from sympy.parsing.latex import parse_latex
import os

# Resolve path to the directory where views.py lives
image_dir = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'image'))
os.makedirs(image_dir, exist_ok=True)

plot_path = os.path.join(image_dir, 'result.png')


def is_system_of_linear_equations(latex_input):
    try:
        # Strip whitespace around commas before splitting
        cleaned_input = ','.join(part.strip()
                                 for part in latex_input.split(','))
        equations_str = [eq for eq in cleaned_input.split(
            ',') if eq]  # Filter empty strings

        # If only one equation (or zero) after splitting, it's not a system
        if len(equations_str) <= 1:  # Check length EARLY
            return False

        equations = [parse_latex(eq) for eq in equations_str]

        # Check if all parsed inputs are equations
        if not all(isinstance(eq, sp.Equality) for eq in equations):
            return False

        # Check if all equations are linear
        all_vars = set().union(*[eq.free_symbols for eq in equations])
        if not all_vars:  # No variables means not a typical system to solve
            return False

        for eq in equations:
            expr = eq.lhs - eq.rhs
            for var in expr.free_symbols:
                # Check degree with respect to each variable present
                try:
                    if sp.degree(expr, var) > 1:
                        return False
                # Handle cases where degree might not be defined (e.g., constants)
                except ValueError:
                    pass
            # Also check for non-polynomial terms if needed (e.g., sin(x))
            # This basic check assumes polynomial linearity
                if not expr.is_polynomial(*all_vars):
                    # More robust check: ensure only terms of degree 0 or 1 exist
                    poly_form = sp.poly(expr, *all_vars)
                    if poly_form.total_degree() > 1:
                        return False

        return True
    except Exception as e:  # Catch parsing errors etc.
        # print(f"Debug: is_system_of_linear_equations check failed: {e}") # Optional debug print
        return False


def solve_algebra(expr_latex, solve_for=None):
    """
    Comprehensive function to solve polynomial and linear equations,
    with support for LaTeX input and visualization.

    Args:
        expr_latex: A string containing LaTeX expression, or a SymPy expression
        solve_for: Symbol to solve for (optional, can be inferred)

    Returns:
        The result of the algebra operation (solution, factorization, etc.)
    """
    try:
        try:
            expr = parse_latex(expr_latex)
        except:
            expr = sp.sympify(expr_latex)

        # Check if it's an equation (contains =)
        if isinstance(expr, sp.Equality):
            return handle_equation(expr, solve_for)
        else:
            # Handle polynomial
            return analyze_polynomial(expr, solve_for)

    except Exception as e:
        # print(f"Error in algebra solver: {str(e)}")
        return {
            "error": str(e),
            "original": expr_latex
        }


def handle_equation(equation, solve_for=None):
    """Process and visualize an equation"""
    left_side = equation.lhs
    right_side = equation.rhs

    # Move all terms to left side
    expr = left_side - right_side

    # If solve_for is not provided, try to identify the variable
    if solve_for is None:
        all_symbols = list(expr.free_symbols)
        if len(all_symbols) == 0:
            print("No variables found in the equation.")
            return {"error": "No variables found in the expression"}
        if len(all_symbols) > 1:
            print(
                f"Multiple variables found: {all_symbols}. Please specify which to solve for.")
            return {"error": f"Multiple variables found: {all_symbols}. Please specify which to solve for."}
        solve_for = all_symbols[0]

    # Check if it's a linear equation or polynomial
    degree_sympy = get_polynomial_degree(expr, solve_for)
    degree = None
    if degree_sympy is not None:
        try:
            # Explicitly convert SymPy number to Python int
            degree = int(degree_sympy)
        except TypeError:
            # Handle cases where degree might be symbolic or non-numeric if needed
            print(
                f"Warning: Could not convert degree '{degree_sympy}' to standard Python int.")
    # Display original equation
    # print("Original equation:")
    # display(Math(sp.latex(left_side) + " = " + sp.latex(right_side)))

    # Solve the equation
    solution = sp.solve(equation, solve_for)

    # Display results
    # print(f"Solving for {solve_for}:")
    if len(solution) == 0:
        print("No solution found.")
    else:
        print(f"Found {len(solution)} solution(s):")

# Replace I with I for sympy compatibility

        for i, sol in enumerate(solution):
            print(f"  Solution {i+1}: {solve_for} = {sol}")
            # display(Math(sp.latex(solve_for) + " = " + sp.latex(sol)))

    # Visualize the equation
    plot_polynomial(expr, solve_for, solution)

    eq_type = "linear_equation" if degree == 1 else "polynomial_equation" if degree is not None and degree > 1 else "equation"

    return {
        "original": sp.latex(left_side) + " = " + sp.latex(right_side),
        "variable": sp.latex(solve_for),
        "degree": degree,
        "solution": [sp.latex(sol) for sol in solution],
        "type": eq_type,  # Add this line
    }


def analyze_polynomial(expr, variable=None):
    """Analyze and visualize a polynomial expression"""
    # If variable is not provided, try to identify it
    if variable is None:
        all_symbols = list(expr.free_symbols)
        if len(all_symbols) == 0:
            print("No variables found in the expression.")
            return {"error": "No variables found in the expression"}
        if len(all_symbols) > 1:
            print(
                f"Multiple variables found: {all_symbols}. Using {all_symbols[0]} for analysis.")
        variable = all_symbols[0]

    # Display the original expression
    # print("Original polynomial:")
    # display(Math(sp.latex(expr)))

    # Get polynomial degree
    degree_sympy = get_polynomial_degree(expr, variable)
    # print(f"Degree: {degree}")
    degree = None
    if degree_sympy is not None:
        try:
            # Explicitly convert SymPy number to Python int
            degree = int(degree_sympy)
        except TypeError:
            print(
                f"Warning: Could not convert polynomial degree '{degree_sympy}' to standard Python int.")
    # Expand the expression
    expanded = sp.expand(expr)
    # if expanded != expr:
    #     print("Expanded form:")
    #     display(Math(sp.latex(expanded)))

    # Factor the expression
    factored = sp.factor(expr)
    # if factored != expr:
    #     print("Factored form:")
    #     display(Math(sp.latex(factored)))

    # Find the roots (zeros) of the polynomial
    roots = sp.solve(expr, variable)

    # if len(roots) > 0:
    #     print(f"Roots of the polynomial (where {sp.latex(expr)} = 0):")
    #     for i, root in enumerate(roots):
    #         print(f"  Root {i+1}: {variable} = {root}")
    #         display(Math(sp.latex(variable) + " = " + sp.latex(root)))

    # Compute derivative and critical points
    derivative = sp.diff(expr, variable)
    critical_points = sp.solve(derivative, variable)

    # if len(critical_points) > 0:
    #     print("Critical points (where the derivative is zero):")
    #     for i, cp in enumerate(critical_points):
    #         print(f"  Critical point {i+1}: {variable} = {cp}")
    #         display(Math(sp.latex(variable) + " = " + sp.latex(cp)))

    # Visualize the polynomial
    plot_polynomial(expr, variable, roots, critical_points)

    return {
        'original': sp.latex(expr),
        'degree': degree,
        'expanded': sp.latex(expanded),
        'factored': sp.latex(factored),
        # Roots are the solution here
        'solution': [sp.latex(root) for root in roots],
        'derivative': sp.latex(derivative),
        'critical_points': [sp.latex(cp) for cp in critical_points],
        "type": "polynomial_analysis",  # Add this line

    }


def get_polynomial_degree(expr, variable):
    """Get the degree of a polynomial in terms of the given variable"""
    try:
        return sp.degree(expr, gen=variable)
    except:
        # If degree fails, try polynomial
        try:
            poly = sp.Poly(expr, variable)
            return poly.degree()
        except:
            # Not a polynomial or degree cannot be determined
            return None


def plot_polynomial(expr, variable, roots=None, critical_points=None):
    """Plot a polynomial and mark its roots and critical points"""
    # Create function for plotting
    try:
        f = sp.lambdify(variable, expr, 'numpy')
    except Exception as e:
        print(f"Error creating function for plotting: {e}")
        return

    # Determine a reasonable x-range based on roots and critical points
    all_points = []
    if roots:
        for root in roots:
            try:
                all_points.append(float(root))
            except:
                pass

    if critical_points:
        for cp in critical_points:
            try:
                all_points.append(float(cp))
            except:
                pass

    if all_points:
        min_point = min(all_points)
        max_point = max(all_points)
        span = max_point - min_point

        if span < 1e-10:  # Points are very close together
            x_min = min_point - 5
            x_max = max_point + 5
        else:
            padding = max(span * 0.5, 2)
            x_min = min_point - padding
            x_max = max_point + padding
    else:
        # Default range if no points
        x_min, x_max = -5, 5

    # Create x-values for plotting
    xs = np.linspace(x_min, x_max, 1000)

    # Evaluate function
    try:
        ys = f(xs)
    except Exception as e:
        print(f"Error evaluating function: {e}")
        return

    # Create plot
    plt.figure(figsize=(10, 6))

    # Plot the polynomial
    plt.plot(xs, ys, color="#1C3041", linewidth=2,
             label=f"${sp.latex(expr)}$")

    # Mark the roots
    if roots:
        for root in roots:
            try:
                x_root = float(root)
                if x_min <= x_root <= x_max:
                    plt.scatter([x_root], [0], color='red', s=80, zorder=5)
                    plt.text(x_root, 0, f"  Root: {x_root:.2f}",
                             verticalalignment='bottom')
            except:
                pass
                # print(f"Could not plot root: {root}")

    # Mark the critical points
    if critical_points:
        for cp in critical_points:
            try:
                x_cp = float(cp)
                if x_min <= x_cp <= x_max:
                    y_cp = f(x_cp)
                    plt.scatter([x_cp], [y_cp], color='green', s=80, zorder=5)
                    plt.text(x_cp, y_cp, f"  Critical Point: {x_cp:.2f}",
                             verticalalignment='top')
            except:
                pass
                # print(f"Could not plot critical point: {cp}")

    # Add labels and title
    plt.xlabel(f"${variable}$", fontsize=12)
    plt.ylabel(f"${sp.latex(expr)}$", fontsize=12)
    plt.title(f"Polynomial: ${sp.latex(expr)}$", fontsize=14)
    plt.grid(True, alpha=0.3)

    # Add a horizontal line at y=0
    plt.axhline(y=0, color='gray', linestyle='-', alpha=0.3)

    # Show key information in a text box
    info_text = ""
    if roots:
        info_text += f"Roots: {', '.join([str(root) for root in roots])}\n"
    if critical_points:
        info_text += f"Critical points: {', '.join([str(cp) for cp in critical_points])}"

    if info_text:
        plt.figtext(0.5, 0.01, info_text,
                    ha="center", fontsize=9,
                    bbox={"facecolor": "white", "alpha": 0.5, "pad": 5})

    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    # plt.show()


def solve_system_of_equations(equations, variables=None):
    """
    Solve a system of linear equations and visualize the solution space.

    Args:
        equations: List of equations or expressions (if expression, assumes == 0)
        variables: List of variables to solve for (optional)

    Returns:
        solution to the system
    """
    # Convert expressions to equations if needed
    eq_list = []
    for eq in equations:
        if not isinstance(eq, sp.Equality):
            eq = sp.Eq(eq, 0)
        eq_list.append(eq)

    # Display the system
    # print("System of equations:")
    for i, eq in enumerate(eq_list):
        display(Math(sp.latex(eq)))

    # If variables not provided, extract from equations
    if variables is None:
        all_symbols = set()
        for eq in eq_list:
            all_symbols.update(eq.free_symbols)
        variables = list(all_symbols)

    # Solve the system
    solution = sp.solve(eq_list, variables, dict=True)

    # Prepare result dictionary
    result = {
        "original_equations": [sp.latex(eq) for eq in eq_list],
        "type": "system_of_equations",
        "variables": [sp.latex(var) for var in variables],
        "num_solution": len(solution),
        "solution": []
    }

    # Display results
    if not solution:
        print("No solution found.")
        result["status"] = "No solution found"
    # elif len(solution) == 1:
    #     print("Unique solution found:")
    #     result["status"] = "Solution(s) found"
    #     # for var, val in solution[0].items():
    #     #     print(f"  {var} = {val}")
    #     #     display(Math(sp.latex(var) + " = " + sp.latex(val)))

    # else:
    #     print(f"Multiple solution found ({len(solution)}):")
    #     result["status"] = "solution found"
    #     for i, sol in enumerate(solution):
    #         print(f"Solution {i+1}:")
    #         for var, val in sol.items():
    #             print(f"  {var} = {val}")
    #             display(Math(sp.latex(var) + " = " + sp.latex(val)))
    else:
        result["status"] = "Solution(s) found"

        for sol_dict in solution:
            # Create a solution entry
            solution_entry = {}
            for var, val in sol_dict.items():
                solution_entry[sp.latex(var)] = sp.latex(val)

            result["solution"].append(solution_entry)

    # Visualize if 2 or 3 variables
    if len(variables) == 2:
        plot_2d_system(eq_list, variables, solution)
    elif len(variables) == 3:
        print("3D visualization is not yet implemented.")

    return solution


def plot_2d_system(equations, variables, solution):
    """Plot a system of 2 equations in 2 variables"""
    x_var, y_var = variables[0], variables[1]

    # Create figure
    plt.figure(figsize=(10, 8))

    # Define limits for the plot
    x_min, x_max = -10, 10
    y_min, y_max = -10, 10

    # If we have solution, adjust the limits
    if solution:
        x_vals = []
        y_vals = []
        for sol in solution:
            if x_var in sol:
                try:
                    x_vals.append(float(sol[x_var]))
                except:
                    pass
            if y_var in sol:
                try:
                    y_vals.append(float(sol[y_var]))
                except:
                    pass

        if x_vals:
            x_min = min(x_vals) - 5
            x_max = max(x_vals) + 5
        if y_vals:
            y_min = min(y_vals) - 5
            y_max = max(y_vals) + 5

    # Plot each equation
    colors = ['#1C3041', '#D14124', '#BA5E09', '#4C65E2', '#63AA55']
    for i, eq in enumerate(equations):
        color = colors[i % len(colors)]

        # Rearrange the equation to y = f(x) and x = f(y) forms
        try:
            # Try y as a function of x
            y_expr = sp.solve(eq, y_var)
            for y_solution in y_expr:
                f_y = sp.lambdify(x_var, y_solution, 'numpy')
                x = np.linspace(x_min, x_max, 1000)

                # Filter out NaN and inf values
                try:
                    y = f_y(x)
                    valid_indices = np.isfinite(y)
                    plt.plot(x[valid_indices], y[valid_indices],
                             color=color, label=f"${sp.latex(eq)}$")
                except Exception as e:
                    print(f"Error plotting y=f(x): {e}")
        except:
            pass

        try:
            # Try x as a function of y
            x_expr = sp.solve(eq, x_var)
            for x_solution in x_expr:
                f_x = sp.lambdify(y_var, x_solution, 'numpy')
                y = np.linspace(y_min, y_max, 1000)

                # Filter out NaN and inf values
                try:
                    x = f_x(y)
                    valid_indices = np.isfinite(x)
                    plt.plot(x[valid_indices], y[valid_indices], color=color)
                except Exception as e:
                    pass
                    # print(f"Error plotting x=f(y): {e}")
        except:
            pass

    # Mark the solution
    if solution:
        for sol in solution:
            if x_var in sol and y_var in sol:
                try:
                    x_sol = float(sol[x_var])
                    y_sol = float(sol[y_var])
                    plt.scatter([x_sol], [y_sol],
                                color='green', s=100, zorder=5)
                    plt.text(x_sol, y_sol, f"  ({x_sol:.2f}, {y_sol:.2f})",
                             verticalalignment='bottom')
                except:
                    pass
                    # print(f"Could not plot solution: {sol}")

    # Add labels and title
    plt.xlabel(f"${x_var}$", fontsize=12)
    plt.ylabel(f"${y_var}$", fontsize=12)
    plt.title(f"System of Equations", fontsize=14)
    plt.grid(True, alpha=0.3)
    plt.legend(fontsize=10)

    # Set equal aspect ratio
    plt.axis('equal')

    # Show solution in a text box
    if solution:
        solution_text = "solution:\n"
        for i, sol in enumerate(solution):
            solution_text += f"({i+1}) "
            solution_text += ", ".join(
                [f"{var}={sol[var]}" for var in variables if var in sol])
            solution_text += "\n"

        plt.figtext(0.5, 0.01, solution_text,
                    ha="center", fontsize=12,
                    bbox={"facecolor": "white", "alpha": 0.5, "pad": 5})

    plt.savefig(plot_path, dpi=300, bbox_inches='tight')
    # plt.show()


def solve_expression(expression_str):
    # Convert the string into a sympy expression
    expression = sp.sympify(expression_str)

    # Simplify the expression
    simplified_expression = sp.simplify(expression)

    # If the expression is an equation, solve it
    if expression.is_Eq:
        solution = sp.solve(expression, dict=True)
    else:
        solution = simplified_expression

    return solution
