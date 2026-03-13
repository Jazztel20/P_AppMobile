## Back-End Configuration
Configure the .env file to be rethrieved in back-end folder


port : 6033

Delete the variable environment value of the key already generated.

```
node ace generate:key 

node ace migration:reset

node ace migration:run 

node ace db:seed 
```
