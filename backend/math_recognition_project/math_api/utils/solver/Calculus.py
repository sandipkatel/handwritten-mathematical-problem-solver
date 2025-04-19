from sympy import sympify, pi, E
import math
import sympy as sp
import numpy as np
import matplotlib.pyplot as plt
from IPython.display import Math, display
from sympy.parsing.latex import parse_latex
import os


image_dir = os.path.abspath(os.path.join(
    os.path.dirname(__file__), '..', '..', 'image'))
os.makedirs(image_dir, exist_ok=True)

plot_path = os.path.join(image_dir, 'result.png')


# Convert bounds to float for plotting

def convert_bound_to_float(bound):
    if isinstance(bound, (int, float, sp.Number)):
        return float(bound)

    if isinstance(bound, (sp.Symbol, sp.Expr)):
        replacements = {}

        symbols = list(bound.free_symbols)
        for symbol in symbols:
            if symbol.name == 'pi':
                replacements[symbol] = sp.pi
            elif symbol.name == 'e':
                replacements[symbol] = sp.E

        if replacements:
            bound = bound.subs(replacements)

    return float(bound.evalf())


def solve_calculus(expr_latex):
    """
    Comprehensive function to solve both integration and differentiation problems,
    with support for LaTeX input and visualization.

    Args:
        expr_latex: A string containing LaTeX expression, or a SymPy expression
                    Can be an indefinite/definite integral or a derivative

    Returns:
        The result of the calculus operation (integral or derivative)
    """
    try:
        if "\\int" in expr_latex:
            # Handle LaTeX integration
            expr = parse_latex_integral(expr_latex)
        elif "\\frac{d}{d" in expr_latex or "\\frac{\\partial}{\\partial" in expr_latex:
            # Handle LaTeX differentiation
            expr = parse_latex_derivative(expr_latex)
        else:
            # Regular expression
            try:
                expr = parse_latex(expr_latex)
            except:
                expr = sp.sympify(expr_latex)

        # Determine the type of operation and solve accordingly
        if isinstance(expr, sp.Integral):
            return handle_integration(expr)
        elif isinstance(expr, sp.Derivative):
            return handle_differentiation(expr)
        else:
            # If not calculus
            print("No calculus operation detected. Analyzing the function.")
            # analyze_function(expr)
            return {
                "original": sp.latex(expr),
                "type": "non_calculus"
            }

    except Exception as e:
        print(f"Error in calculus solver: {str(e)}")
        return {
            "error": str(e),
            "original": expr_latex
        }


def parse_latex_integral(latex_str):
    """Parse a LaTeX integral expression into a SymPy Integral object"""
    try:
        return parse_latex(latex_str)
    except Exception as e:
        print(f"Standard LaTeX parsing failed: {e}")

        try:
            # Check for definite integral
            if "\\int_{" in latex_str and "}" in latex_str and "^{" in latex_str:
                # Extract bounds
                lower_bound_start = latex_str.find("\\int_{") + 6
                lower_bound_end = latex_str.find("}", lower_bound_start)
                lower_bound_str = latex_str[lower_bound_start:lower_bound_end]

                upper_bound_start = latex_str.find("^{", lower_bound_end) + 2
                upper_bound_end = latex_str.find("}", upper_bound_start)
                upper_bound_str = latex_str[upper_bound_start:upper_bound_end]

                # Extract integrand and variable
                integrand_start = upper_bound_end + 1
                d_idx = latex_str.rfind("\\,d")
                if d_idx == -1:
                    d_idx = latex_str.rfind("d")

                integrand_str = latex_str[integrand_start:d_idx].strip()
                var_str = latex_str[d_idx+1:].strip()

                # Convert to sympy expressions
                lower_bound = sp.sympify(lower_bound_str)
                upper_bound = sp.sympify(upper_bound_str)
                var = sp.Symbol(var_str)

                # Handle common LaTeX expressions
                if " e^" in integrand_str or " e^{" in integrand_str:
                    integrand_str = integrand_str.replace(" e^", " \exp")

                integrand = sp.sympify(integrand_str)

                # Create the integral expression
                return sp.Integral(integrand, (var, lower_bound, upper_bound))

            # Check for indefinite integral
            elif "\\int " in latex_str:
                # Extract integrand and variable
                integrand_start = latex_str.find("\\int ") + 5
                d_idx = latex_str.rfind("\\,d")
                if d_idx == -1:
                    d_idx = latex_str.rfind("d")

                integrand_str = latex_str[integrand_start:d_idx].strip()
                var_str = latex_str[d_idx+1:].strip()

                # Handle common LaTeX expressions
                if "e^" in integrand_str or "e^{" in integrand_str:
                    integrand_str = integrand_str.replace("e^", "exp")

                # Convert to sympy expressions
                var = sp.Symbol(var_str)
                integrand = sp.sympify(integrand_str)

                # Create the integral expression
                return sp.Integral(integrand, var)

        except Exception as nested_e:
            print(f"Manual integral parsing failed: {nested_e}")
            return {
                "error": str(e),
                "original": latex_str
            }


def parse_latex_derivative(latex_str):
    """Parse a LaTeX derivative expression into a SymPy Derivative object"""
    try:
        return parse_latex(latex_str)
    except Exception as e:
        print(f"Standard LaTeX parsing failed for derivative: {e}")

        try:
            # First order
            if "\\frac{d}{d" in latex_str:
                var_start = latex_str.find("\\frac{d}{d") + 9
                var_end = latex_str.find("}", var_start)
                var_str = latex_str[var_start:var_end]

                func_start = latex_str.find("}", var_end) + 1
                func_str = latex_str[func_start:].strip()

                # Convert to sympy expressions
                var = sp.Symbol(var_str)
                func = sp.sympify(func_str)

                # Create derivative
                return sp.Derivative(func, var)

            # Higher order derivatives
            elif "\\frac{d^" in latex_str:
                order_start = latex_str.find("\\frac{d^") + 9
                order_end = latex_str.find("}", order_start)
                order_str = latex_str[order_start:order_end]

                var_start = latex_str.find("{d", order_end) + 2
                var_end = latex_str.find("^", var_start)
                var_str = latex_str[var_start:var_end]

                func_start = latex_str.find("}", var_end) + 1
                func_str = latex_str[func_start:].strip()

                # Convert to sympy expressions
                var = sp.Symbol(var_str)
                func = sp.sympify(func_str)
                order = int(order_str)

                # Create derivative
                return sp.Derivative(func, (var, order))

        except Exception as nested_e:
            print(f"Manual derivative parsing failed: {nested_e}")
            return {
                "error": str(e),
                "original": latex_str
            }


def handle_integration(expr):
    """Process and visualize an integration problem"""
    # Extract information from the integral
    integrand = expr.function
    is_definite_integral = False
    integration_var = None
    lower_bound = None
    upper_bound = None

    if len(expr.limits) > 0:
        limit = expr.limits[0]
        if len(limit) == 3:  # Definite integral
            is_definite_integral = True
            integration_var = limit[0]
            lower_bound = limit[1]
            upper_bound = limit[2]
        elif len(limit) == 1 or len(limit) == 2:  # Indefinite integral
            integration_var = limit[0]

    # Perform integration
    if is_definite_integral:
        # For definite integrals, compute the numerical result
        indefinite_integral = sp.integrate(integrand, integration_var)

        # Special case for exp(x)
        if integrand == sp.exp(integration_var):
            integral_result = sp.exp(upper_bound) - sp.exp(lower_bound)
        else:
            try:
                # Use the fundamental theorem of calculus
                upper_value = indefinite_integral.subs(
                    integration_var, upper_bound)
                lower_value = indefinite_integral.subs(
                    integration_var, lower_bound)
                integral_result = upper_value - lower_value
            except Exception as e:
                print(f"Error evaluating at bounds: {e}")
                # Fallback to direct integration
                integral_result = sp.integrate(
                    integrand, (integration_var, lower_bound, upper_bound))

        # Display results
        print(f"Definite integral from {lower_bound} to {upper_bound}:")
        print(f"∫({integrand}) d{integration_var} = {integral_result}")
        # print("\nOriginal expression:", integrand)
        # display(Math(sp.latex(integrand)))
        print(f"Indefinite integral: {indefinite_integral}")
        display(Math(sp.latex(indefinite_integral)))
        print(
            f"Definite integral result from {lower_bound} to {upper_bound}: {integral_result}")
        # display(Math(r"\int_{" + sp.latex(lower_bound) + r"}^{" + sp.latex(upper_bound) + r"} " +
        #             sp.latex(integrand) + r" \, d" + sp.latex(integration_var) + r" = " +
        #             sp.latex(integral_result)))
        result_print = r"\int_{" + sp.latex(lower_bound) + r"}^{" + sp.latex(upper_bound) + r"} " + sp.latex(
            integrand) + r" \, d" + sp.latex(integration_var) + r" = " + sp.latex(integral_result)

        # Plot the definite integral
        plot_definite_integral(integrand, indefinite_integral,
                               integration_var, lower_bound, upper_bound, integral_result)
        # Prepare result dictionary
        result = {
            "original": sp.latex(expr),
            "type": "definite_integral",
            "variable": sp.latex(integration_var),
            "lower_bound": sp.latex(lower_bound),
            "upper_bound": sp.latex(upper_bound),
            "indefinite_integral": sp.latex(indefinite_integral),
            "solution": sp.latex(integral_result)
        }

    else:
        # For indefinite integrals
        indefinite_integral = sp.integrate(integrand, integration_var)

        # Display results
        print("Indefinite integration:")
        # print("Original expression:", integrand)
        # display(Math(sp.latex(integrand)))
        print("Integration Result:", indefinite_integral)
        # display(Math(sp.latex(indefinite_integral)))
        result_print = sp.latex(expr) + r" = " + \
            sp.latex(indefinite_integral) + r"C"

        # Plot the indefinite integral
        plot_indefinite_integral(
            integrand, indefinite_integral, integration_var)
        result = {
            "original": sp.latex(expr),
            "type": "indefinite_integral",
            "variable": sp.latex(integration_var),
            "solution": sp.latex(indefinite_integral)
        }
    return result


def handle_differentiation(expr):
    """Process and visualize a differentiation problem"""
    # Extract information from the derivative
    function = expr.expr
    variables = expr.variables

    # Get the differentiation variable and order
    if isinstance(variables[0], tuple):
        diff_var, order = variables[0]
    else:
        diff_var = variables[0]
        order = 1

    # Compute the derivative
    derivative_result = sp.diff(function, diff_var, order)

    # Display results
    print("Differentiation:")
    if order == 1:
        print(f"d/d{diff_var}({function}) = {derivative_result}")
        result_print = r"\frac{d}{d" + sp.latex(diff_var) + r"}\left(" + sp.latex(
            function) + r"\right) = " + sp.latex(derivative_result)
        # display(Math(r"\frac{d}{d" + sp.latex(diff_var) + r"}\left(" + sp.latex(function) + r"\right) = " + sp.latex(derivative_result)))
    else:
        print(f"d^{order}/d{diff_var}^{order}({function}) = {derivative_result}")
        result_print = r"\frac{d^{" + str(order) + r"}}{d" + sp.latex(diff_var) + r"^{" + str(
            order) + r"}}\left(" + sp.latex(function) + r"\right) = " + sp.latex(derivative_result)
        # display(Math(r"\frac{d^{" + str(order) + r"}}{d" + sp.latex(diff_var) + r"^{" + str(order) + r"}}\left(" + sp.latex(function) + r"\right) = " + sp.latex(derivative_result)))

    # Plot the function and its derivative
    critical_points = plot_derivative(
        function, derivative_result, diff_var, order)
    critical_analysis = []
    critical_analysis = []
    if critical_points:
        try:
            # Use diff_var here
            second_derivative = sp.diff(function, diff_var, 2)
            has_second_derivative = True
        except Exception as e_diff:
            print(f"Could not compute second derivative: {e_diff}")
            has_second_derivative = False

        for point in critical_points:
            point_analysis = {"point": sp.latex(
                sp.sympify(point))}  # Start analysis entry
            try:
                # Use diff_var for substitution
                point_expr = sp.sympify(point)
                point_analysis["value"] = sp.latex(
                    function.subs(diff_var, point_expr))

                if has_second_derivative:
                    # Use diff_var for substitution
                    second_val_expr = second_derivative.subs(
                        diff_var, point_expr)
                    # Check if the result is numerical before converting to float
                    if second_val_expr.is_Number:
                        second_val = float(second_val_expr)
                        if second_val > 1e-9:  # Add tolerance for float comparison
                            kind = "Minimum"
                        elif second_val < -1e-9:
                            kind = "Maximum"
                        else:
                            # Could be inflection or test inconclusive
                            # A more robust test (e.g., higher derivatives) might be needed
                            kind = "Inflection/Other (2nd deriv=0)"
                        point_analysis["type"] = kind
                    else:
                        point_analysis["type"] = "Non-numeric 2nd deriv"
                else:
                    point_analysis["type"] = "2nd deriv unavailable"

            except Exception as e_inner:
                print(f"Could not analyze critical point {point}: {e_inner}")
                point_analysis["type"] = "Analysis Failed"
                if "value" not in point_analysis:
                    point_analysis["value"] = "N/A"

            critical_analysis.append(point_analysis)

        result = {
            "original": sp.latex(expr),
            "type": "derivative",
            "variable": sp.latex(diff_var),
            "order": order,
            "solution": sp.latex(derivative_result),
            "final_result": result_print,
            "critical_points_analysis": critical_analysis  # Use the populated list
        }

        return result


def plot_indefinite_integral(function, integral, var, x_range=(-5, 5), num_points=1000):
    """Plot a function and its indefinite integral"""
    try:
        xs = np.linspace(x_range[0], x_range[1], num_points)

        # Convert sympy expressions to numpy functions
        try:
            if function == sp.exp(var):
                def fx(x): return np.exp(x)  # Handle e^x directly
            else:
                fx = sp.lambdify(var, function, 'numpy')

            if integral == sp.exp(var):
                def fx_int(x): return np.exp(x)  # Handle e^x directly
            else:
                fx_int = sp.lambdify(var, integral, 'numpy')
        except Exception as e:
            print(f"Error creating function for plotting: {e}")
            return {
                "error": str(e),
                "original": sp.latex(function)
            }

        # Calculate function values
        try:
            ys_fx = fx(xs)
            ys_fx_int = fx_int(xs)
        except Exception as e:
            print(f"Error calculating function values: {e}")
            return {
                "error": str(e),
                "original": sp.latex(function)
            }

        # Plot function and its integral
        plt.figure(figsize=(10, 6))

        # Plot original function
        plt.plot(xs, ys_fx, color="#1C3041", linewidth=2,
                 label=f"$f'({var}) = {sp.latex(function)}$")
        plt.fill_between(xs, ys_fx, alpha=0.3)

        # Plot integral
        plt.plot(xs, ys_fx_int, color="#BA5E09", linewidth=2,
                 linestyle='dashed', label=f"$f({var}) = {sp.latex(integral)} + C$")

        # Add labels and title
        plt.xlabel(f"${var}$", fontsize=12)
        plt.ylabel("$y$", fontsize=12)
        plt.title(f"Function and its Integral", fontsize=14)
        plt.legend(fontsize=10)
        plt.grid(True, alpha=0.3)

        # Add formula in a text box
        # plt.figtext(0.5, 0.01,
        #            f"$\\int {sp.latex(function)} \\, d{var} = {sp.latex(integral)} + C$",
        #            ha="center", fontsize=12,
        #            bbox={"facecolor":"white", "alpha":0.5, "pad":5})

        # Save and show plot
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        # plt.show()

    except Exception as e:
        print(f"Error in plotting indefinite integral: {e}")
        return {
            "error": str(e),
            "original": sp.latex(function)
        }


def plot_definite_integral(function, indefinite, var, lower_bound, upper_bound, result):
    """Plot a function and visualize its definite integral"""
    try:
        # Convert bounds to numerical values
        l_bound = convert_bound_to_float(lower_bound)
        u_bound = convert_bound_to_float(upper_bound)
        padding = (u_bound - l_bound) * 0.2
        x_min = l_bound - padding
        x_max = u_bound + padding

        xs = np.linspace(x_min, x_max, 1000)

        # Convert sympy expressions to numpy functions
        try:
            if function == sp.exp(var):
                def fx(x): return np.exp(x)  # Handle e^x directly
            else:
                fx = sp.lambdify(var, function, 'numpy')

            if indefinite == sp.exp(var):
                def fx_int(x): return np.exp(x)  # Handle e^x directly
            else:
                fx_int = sp.lambdify(var, indefinite, 'numpy')
        except Exception as e:
            print(f"Error creating function for plotting: {e}")
            return {
                "error": str(e),
                "original": sp.latex(function)
            }

        # Calculate function values
        try:
            ys_fx = fx(xs)
        except Exception as e:
            print(f"Error calculating function values: {e}")
            return {
                "error": str(e),
                "original": sp.latex(function)
            }

        # Plot the function and highlight the area
        plt.figure(figsize=(10, 6))

        # Plot original function
        plt.plot(xs, ys_fx, color="#1C3041", linewidth=2,
                 label=f"$f({var}) = {sp.latex(function)}$")

        # Shade the area under the curve between bounds
        x_bound = np.linspace(l_bound, u_bound, 500)
        y_bound = fx(x_bound)
        plt.fill_between(x_bound, y_bound, alpha=0.4, color="#1C3041")

        # Plot vertical lines at bounds
        plt.axvline(x=l_bound, color='gray', linestyle='--', alpha=0.7)
        plt.axvline(x=u_bound, color='gray', linestyle='--', alpha=0.7)

        # Add annotations for bounds
        plt.text(l_bound, min(ys_fx), f"{lower_bound}",
                 verticalalignment='bottom', horizontalalignment='center')
        plt.text(u_bound, min(ys_fx), f"{upper_bound}",
                 verticalalignment='bottom', horizontalalignment='center')

        # Add labels and title
        plt.xlabel(f"${var}$", fontsize=12)
        plt.ylabel("$y$", fontsize=12)
        plt.title(f"Definite Integral: ${sp.latex(result)}$", fontsize=14)
        plt.legend(fontsize=10)
        plt.grid(True, alpha=0.3)

        # Add formula in a text box
        plt.figtext(0.5, 0.01,
                    f"$\\int_{{{sp.latex(lower_bound)}}}^{{{sp.latex(upper_bound)}}} {sp.latex(function)} \\, d{var} = {sp.latex(result)}$",
                    ha="center", fontsize=12,
                    bbox={"facecolor": "white", "alpha": 0.5, "pad": 5})

        # Save and show plot
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        # plt.show()

    except Exception as e:
        print(f"Error in plotting definite integral: {e}")
        return {
            "error": str(e),
            "original": sp.latex(function)
        }


def plot_derivative(function, derivative, var, order=1, x_range=(-5, 5), num_points=1000):
    """Plot a function and its derivative"""
    try:
        xs = np.linspace(x_range[0], x_range[1], num_points)

        # Convert sympy expressions to numpy functions
        fx = sp.lambdify(var, function, 'numpy')
        dfx = sp.lambdify(var, derivative, 'numpy')

        # Calculate function values
        ys_fx = fx(xs)
        ys_dfx = dfx(xs)

        # Plot function and its derivative
        plt.figure(figsize=(10, 6))

        # Plot original function
        plt.plot(xs, ys_fx, color="#1C3041", linewidth=2,
                 label=f"$f({var}) = {sp.latex(function)}$")

        # Plot derivative
        plt.plot(xs, ys_dfx, color="#D14124", linewidth=2,
                 linestyle='dashed',
                 label=f"$f^{{{order}}}({var}) = {sp.latex(derivative)}$" if order > 1 else f"$f'({var}) = {sp.latex(derivative)}$")

        # Find critical points
        critical_points = []
        try:
            critical_points_ = sp.solve(derivative, var)
            for point in critical_points:
                try:
                    p_float = float(point)
                    if x_range[0] <= p_float <= x_range[1]:
                        # critical_points.append(p_float)
                        # Mark the critical point
                        plt.scatter([p_float], [fx(p_float)],
                                    color='red', zorder=5, s=50)
                        plt.text(p_float, fx(p_float), f"  ({p_float:.2f}, {fx(p_float):.2f})",
                                 verticalalignment='top')
                except:
                    pass
        except:
            pass

        # Add labels and title
        plt.xlabel(f"${var}$", fontsize=12)
        plt.ylabel("$y$", fontsize=12)
        derivative_order = f"^{order}" if order > 1 else "'"
        plt.title(
            f"Function $f({var})$ and its Derivative $f{derivative_order}({var})$", fontsize=14)
        plt.legend(fontsize=10)
        plt.grid(True, alpha=0.3)

        # Add formula in a text box
        formula = r"\frac{d"
        if order > 1:
            formula += f"^{order}"
        formula += r"}{d" + sp.latex(var)
        if order > 1:
            formula += f"^{order}"
        formula += r"}\left(" + sp.latex(function) + \
            r"\right) = " + sp.latex(derivative)

        plt.figtext(0.5, 0.01, f"${formula}$",
                    ha="center", fontsize=12,
                    bbox={"facecolor": "white", "alpha": 0.5, "pad": 5})

        # Save and show plot
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        # plt.show()

        # If there are critical points, analyze them
        if critical_points:
            second_derivative = sp.diff(function, var, 2)
            print("\nCritical Points Analysis:")
            for point in critical_points:
                try:
                    second_deriv_value = float(
                        second_derivative.subs(var, point))
                    if second_deriv_value > 0:
                        point_type = "Minimum"
                    elif second_deriv_value < 0:
                        point_type = "Maximum"
                    else:
                        point_type = "Inflection point or higher-order critical point"

                    print(
                        f"  {var} = {point:.4f}: {point_type} (f({point:.4f}) = {fx(point):.4f})")
                except:
                    print(f"  {var} = {point}: Could not classify")
                    return {
                        "error": str(e),
                        "original": sp.latex(function)
                    }
            return critical_points
        return None
    except Exception as e:
        print(f"Error in plotting derivative: {e}")
        return {
            "error": str(e),
            "original": sp.latex(function)
        }


# Example usage for derivatives:
# solve_calculus(r"\frac{d}{dx}(x^3 + 2x^2 - 5x + 3)")
# solve_calculus(r"\frac{d^2}{dx^2}(x^3 + 2x^2 - 5x + 3)")
# solve_calculus(sp.Derivative(sp.sympify("x**3 + 2*x**2 - 5*x + 3"), sp.Symbol('x')))
