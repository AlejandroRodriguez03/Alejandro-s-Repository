radio = int(input('Introduzca el radio (en cm**3): '))
altura = int(input('Introduzca la altura (en cm**3): '))
vol = (3.1415*radio**2*altura)
print('El volumen del termo es:',vol,'cm**3')

cond = (vol>=300)
print('Se puede llenar el termo con 300ml?',cond)
