from calendar import c


a = int(input('INGRESE VALOR A: '))
b = int(input('INGRESE VALOR B: '))
c = int(input('INGRESE VALOR C: '))

Resolvente = (-b + (b**2 - 4*a*c)**1/2)/2*a
print(Resolvente)