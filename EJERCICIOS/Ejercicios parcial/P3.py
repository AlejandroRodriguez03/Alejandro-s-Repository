#Hacer lista factores primos numero
#Verificar si cada uno son numeros primos
#Multiplicacion de 2 num primos
#Error al fallar


from symbol import factor


def imprimir_factores_primos(numero):
    # Comience con dos, que es el primer primo
    factor = 2
    # Continúe hasta que el factor sea mayor que el número
    while factor <= numero:
    # Verificar si el factor es un divisor de número
        if not (numero % factor != 0):
        # Si es así, imprímalo y divida el número original
            print(factor)
            numero /= factor
        else:
        # Si no es así, incremente el factor en uno
            factor += 1
    return "Done"

num_prueba = int(input('Ingrese un num entero'))
imprimir_factores_primos(num_prueba)
# Debe imprimir 2,2,5,5





