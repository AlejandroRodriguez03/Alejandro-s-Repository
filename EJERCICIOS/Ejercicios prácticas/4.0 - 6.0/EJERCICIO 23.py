url = input('Ingrese URL Empresarial: ')
primer_nombre = input('Ingrese Primer Nombre: ')
segundo_nombre = input('Ingrese Segundo Nombre: ')
primer_apellido = input('Ingrese Primer Apellido: ')
nacimiento = int(input('Ingrese Año de Nacimiento: '))

t1 = primer_nombre[0]
t2 = segundo_nombre[0]
t3 = primer_apellido
t4 = nacimiento%100
t5 = '@'
t6 = url[:]
t7 = '.com'
correo = (t1+t2+t3+str(t4)+t5+t6+t7)

print('Su correo empresarial es:{}'.format(correo))
