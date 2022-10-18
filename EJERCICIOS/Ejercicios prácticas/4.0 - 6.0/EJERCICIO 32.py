# Escribir un programa que pregunte al usuario una cantidad a invertir, el 
# interés anual y el número de años, y muestre por pantalla el capital obtenido 
# en la inversión cada año que dura la inversión.

cantidad = float(input("¿Cantidad a invertir? "))
intereses = float(input("¿Interés porcentual anual? "))
tiempo = int(input("¿Años?"))
for i in range(tiempo):
    cantidad *= 1 + intereses / 100 
    print("Capital tras " + str(i+1) + " años: " + str(round(cantidad, 2)))


