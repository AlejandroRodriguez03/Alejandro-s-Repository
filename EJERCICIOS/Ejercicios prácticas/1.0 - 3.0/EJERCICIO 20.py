num1 = int(input('Introduzca un numero entero (3 cifras): '))
num2 = int(input('Introduzca un numero entero (1 cifra): '))
cond1 = ((num1%100)%(num2)==0) and ((num2**2)<(num1%100))


print('Cumplen las dos condiciones?',cond1)

