persona = {}
continuar = True
while continuar:
    clave = input('¿Cual dato quieres introducir? ')
    valor = input(clave + ': ')
    persona[clave] = valor
    print(persona)
    continuar = input('¿Quieres añadir más información (Si/No)? ') == "Si"

for clave, valor in persona.items():
    print(f"Tu {clave} es {valor}")
