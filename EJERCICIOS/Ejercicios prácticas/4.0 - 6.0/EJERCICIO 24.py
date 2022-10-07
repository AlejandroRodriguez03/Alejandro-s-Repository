#Ejercicio 3
#Usted cuenta con una cadena de caracteres que simula un tweet donde 
#se mencionan ayudantes de una materia en específico. Ejemplo:
#tweet= "El día de ayer hubo ayudantías con #Joel de FP y #Kevin de CUV ya se divirtieron los pollos, ahora le toca a los gallos con #Axell B)"

tweet ="El día de ayer hubo ayudantías con #Joel de FP y #Kevin de CUV ya se divirtieron los pollos, ahora le toca a los gallos con #Axell B)"
pos1 = tweet.index('#')
subtweet = tweet[pos1+1:]
pos2 = subtweet.index(' ')
subtweet1 = subtweet[:pos2]
print(subtweet1)

pos3 = subtweet.index('#')
subtweet2 = subtweet[pos3+1:]
pos4 = subtweet2.index(' ')
subtweet3 = subtweet2[:pos4]
print(subtweet3)

pos5 = subtweet2.index('#')
subtweet4 = subtweet2[pos5+1:]
pos6 = subtweet4.index(' ')
subtweet5 = subtweet4[:pos6]
print(subtweet5)


