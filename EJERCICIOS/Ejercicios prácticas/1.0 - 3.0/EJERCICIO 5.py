from msilib.schema import Condition


Num = int(input('Introduzca un numero entero: '))
Residuo = Num%2 

if Residuo==0 :
    print('Es par')
else:
    print('Es impar')

