edad = int(input('Introduzca su edad: '))
ingresos = int(input('Introduzca sus ingresos mensuales: '))

if edad>=16 and ingresos>=1000:
    print('El usuario tiene que tributar')
else:
    print('El usuario no tiene que tributar')
