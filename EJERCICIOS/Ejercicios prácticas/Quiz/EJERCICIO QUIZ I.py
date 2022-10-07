products = {
    "mobiles": {
        "Apple": [
            {
                "id": 1,
                "name": "iPhone 7",
                "price": 300
            },
            {
                "id": 2,
                "name": "iPhone 8",
                "price": 350
            },
            {
                "id": 3,
                "name": "iPhone Xr",
                "price": 450
            },
            {
                "id": 4,
                "name": "iPhone Xs",
                "price": 460
            },
            {
                "id": 5,
                "name": "iPhone 11",
                "price": 900
            },
            {
                "id": 6,
                "name": "iPhone 12",
                "price": 1100
            },
            {
                "id": 7,
                "name": "iPhone 13",
                "price": 1300
            },
        ],
        "Samsung": [
            {
                "id": 8,
                "name": "Samsung Galaxy Beam",
                "price": 150
            },
            {
                "id": 9,
                "name": "Samsung Galaxy S6",
                "price": 200
            },
            {
                "id": 10,
                "name": "Samsung Galaxy S7",
                "price": 300
            },
        ],
        "Xiaomi": [
            {
                "id": 11,
                "name": "Xiaomi Redmi Note 8",
                "price": 250
            },
            {
                "id": 12,
                "name": "Xiaomi Redmi Note 8 Pro",
                "price": 300
            },
        ]
    },
    "laptops": {
        "DELL": [
            {
                "id": 13,
                "name": "Dell Inspiron 15",
                "price": 600
            },
            {
                "id": 14,
                "name": "Dell Latitude 14",
                "price": 650
            },
        ],
        "MAC": [
            {
                "id": 15,
                "name": "MacBook Pro 13",
                "price": 900
            },
            {
                "id": 16,
                "name": "MacBook M1",
                "price": 1500
            },
        ]
    },
}

print('**** Bienvenido a la tienda de dispositivos electronicos! ****')
while True:
    seleccion = (input('Seleccione una opcion: \n-1. Ver inventario \n-2. Registrar compra \n-3. Salir \n-'))
    tipos_disponibles = {1: 'mobiles', 2: 'laptops'}
    if seleccion == 1:
        for tipos,marcas in products.items():
            for nombre_marca, products.list in marcas.items():
               print(marcas)
               for products in products.list: 
                  id = products.get('id')
                  product_name = products.get('nombre')
                  price = products.get('precio')
                  print(f'id:{id} - name:{product_name} - price:{price}')
    elif seleccion == 2:
        name = input('Por favor ingrese su nombre: ')
        id_card = input('Por favor ingrese el id de su tarjeta: ')
        product_id = input('Por favor ingrese el id del producto')
        

    elif seleccion == 3:
        break
        


