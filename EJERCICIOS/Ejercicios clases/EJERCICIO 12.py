moneda = {'Euro':'€', 'Dollar':'$', 'Yen':'¥'}
monedas = input('selecciones una moneda: ')
if monedas.title() in moneda:
    print(moneda[monedas.title()])
else:
    print('La moneda no existe :(')
  
