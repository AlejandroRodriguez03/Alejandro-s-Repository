
from itertools import product
from multiprocessing.sharedctypes import Value
import types
from unicodedata import name


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

print('------------------------')
print('---BEST BUY VENEZUELA---')
print('------------------------')

while True:
    print('1. SEE INVENTORY')
    print('2. REGISTER PURCHASE')
    print('3. EXIT THE VIRTUAL STORE')
    print()
    option = int(input('--->'))
    print()
    available_devices = {1: 'mobiles', 2: 'laptops'} 
    
    if option == 1:
       for types,brands in products.items():
           for brand_name, product_list in brands.items():
                print(brand_name)
                for product in product_list:
                    id = product.get('id')
                    product_name = product.get('name')
                    price = product.get('price')
                    print(f'id:{id} - name:{product_name} - price:{price}')
    
    elif option == 2:
        name = input('Please enter your name: ')
        id_card = input('Please enter your id card: ')
        product_id = input('Please enter your id card: ')
        client = {}
        client['name'] = name
        client['id_card'] = id_card
        client['product_id'] = product_id
        product_selected = None

    for types,brands in products.items():
           for brand_name, product_list in brands.items():
                for product in product_list:
                    if product.get('id') == id :
                        product_selected = product
                        

    if product_selected:
        client = {}
        name = input('Please enter your name: ')
        id_card = input('Please enter your id card: ')
        product_id = input('Please enter your id card: ')
        client['name'] = name
        client['id_card'] = id_card
        client['product_id'] = product_id
        print('---RECEIPT---')
        for key,value in client.items():
            if key == product_id:
                print()
            else:
                print(f'Your {key} is {value}')

        

    

