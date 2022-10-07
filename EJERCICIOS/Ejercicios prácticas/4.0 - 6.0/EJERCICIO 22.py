num1 = float(input('Ingrese medida del cateto a (en cm): '))
num2 = float(input('Ingrese medida del cateto b (en cm): '))
hipotenusa = ((num1**2+num2**2)**(1/2))
print('La medida de la hipotenusa es: {:.3f}'.format(hipotenusa))