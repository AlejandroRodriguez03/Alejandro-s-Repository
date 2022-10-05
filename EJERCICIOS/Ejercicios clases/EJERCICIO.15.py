traductor = {}
continuar = True
while continuar:
    clave = input('Introduce palabra en espanol: ')
    valor = input(clave + ': ')
    traductor[clave] = valor
    print(traductor)
    continuar = input('¿Quieres introducir otra palabra? (Si/No)? ') == "Si"

frase = input('Ingrese texto a traducir: ')
frase = valor
print(valor, valor)
