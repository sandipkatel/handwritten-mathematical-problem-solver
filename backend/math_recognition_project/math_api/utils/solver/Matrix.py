import sympy as sp
from sympy.parsing.latex import parse_latex
from IPython.display import display, Math

def parse_matrix(latex_matrix):
    """
    Parses a LaTeX matrix string into a SymPy Matrix.
    Example LaTeX: \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}
    """
    try:
        rows = latex_matrix.replace(r"\begin{bmatrix}", "").replace(r"\end{bmatrix}", "").strip()
        rows = rows.split(r"\\")  # Split into rows
        matrix = [[sp.sympify(cell) for cell in row.split("&")] for row in rows]
        return sp.Matrix(matrix)
    except Exception as e:
        raise ValueError(f"Invalid matrix format: {e}")

def solve_matrix(latex_input):

    try:
        if "+" in latex_input:
            matrices = latex_input.split("+")
            matrix1 = parse_matrix(matrices[0].strip())
            matrix2 = parse_matrix(matrices[1].strip())
            display(Math("%s + %s"%(sp.latex(matrix1), sp.latex(matrix2))))
            result = matrix1 + matrix2
            operation = "Addition"
        elif "-" in latex_input:
            matrices = latex_input.split("-")
            matrix1 = parse_matrix(matrices[0].strip())
            matrix2 = parse_matrix(matrices[1].strip())
            print("Input Detected")
            display(Math("%s - %s"%(sp.latex(matrix1), sp.latex(matrix2))))
            result = matrix1 - matrix2
            operation = "Subtraction"
        elif "*" in latex_input:
            matrices = latex_input.split("*")
            matrix1 = parse_matrix(matrices[0].strip())
            matrix2 = parse_matrix(matrices[1].strip())
            print("Input Detected")
            display(Math("%s * %s"%(sp.latex(matrix1), sp.latex(matrix2))))
            result = matrix1 * matrix2
            operation = "Multiplication"
        else:
            # Single matrix input
            matrix = parse_matrix(latex_input)
            print("Single Matrix Detected:", matrix)
            # display(Math(sp.latex(matrix)))
            # Compute determinant
            determinant = matrix.det()
            print("Determinant:", determinant)
            # display(Math(sp.latex(determinant)))
            # Compute inverse if determinant is non-zero
            if determinant != 0:
                result = matrix.inv()
                operation = "Inverse"
            else:
                print("Matrix is singular, no inverse exists.")
            
        print(f"Matrix {operation} Result:", result)
        # display(Math(sp.latex(result)))
    except Exception as e:
        print("Error in parsing or solving the matrix problem:", str(e))


