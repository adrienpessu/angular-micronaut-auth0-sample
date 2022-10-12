# Secure a Angular + Micronaut application with Auth0

Learn how to create an application with Angular for the frontend and Micronaut for the backend and secure it with an Authorization Server provided by Auth0.

You will need to have Java 11 installed and npm

## Configure Auth0

First and foremost, if you haven't already, [sign up for an Auth0 account](https://auth0.com/signup) to connect your application with the Auth0 Identity Platform.

### Frontend

Next, you'll connect your Single-Page Application (SPA) with Auth0. You'll need to create an application registration in the Auth0 Dashboard and get two configuration values: the Auth0 Domain and the Auth0 Client ID. You'll also need to define an Auth0 Audience value within your project to practice making secure calls to an external API.

If you would rather explore a complete configuration, you can view a sample application instead.

### Configure Callback URLs

A callback URL is a URL in your application that you would like Auth0 to redirect users to after they have authenticated. If not set, users will not be returned to your application after they log in.

> If you are following along with our sample project, set this to http://localhost:4200.

### Configure Logout URLs

A logout URL is a URL in your application that you would like Auth0 to redirect users to after they have logged out. If not set, users will not be able to log out from your application and will receive an error.

> If you are following along with our sample project, set this to http://localhost:4200.

### Configure Allowed Web Origins

Allowed Web Origins URLs will be allowed during the [Cross-Origin Resource Sharing (CORS) mechanism](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

> If you are following along with our sample project, set this to http://localhost:4200.

## Configure Angular frontend

To create an angular app, you can use the Command-Line Interface (CLI). Since you should already have npm, you can use the following command and follow the instructions:
```
npx @angular/cli new 
```

### Add Auth0 to Angular

Once you have, you must add the `@auth0/auth0-angular` npm package. 
```
npm install --save @auth0/auth0-angular
```

### Add Auth0 parameters to environment

Add the domain, clientId and Audience to the environment file : 

``` 
export const environment = {
  auth0: {
    audience: 'http://localhost:8080',
    domain: 'dev-adrien.eu.auth0.com',
    client_id: 'G2xRsl8DQ3R2zD8mLF2rDbPPZ1PZpTma'
  }
};
```

You will find the domain and the clientId in your Auth0 dashboard.
The audience will be the URL of the backend. In our case, the server running Micronaut.

### Configure Auth0Module

Add the Auth0 interceptor in the providers attribute.
```
{ provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
```

Then in the application module, add the Auth0Module in the `imports` : 
``` 
AuthModule.forRoot({
      domain: environment.auth0.domain,
      clientId: environment.auth0.client_id,
      // Request this audience at user authentication time
      audience: environment.auth0.audience,

      // Request this scope at user authentication time
      scope: '',

      // Specify configuration for the interceptor
      httpInterceptor: {
        allowedList: [
          {
            // Match any request that starts 'https://YOUR_DOMAIN/api/v2/' (note the asterisk)
            uri: `${environment.apiUrl}/*`,
            tokenOptions: {
              // The attached token should target this audience
              audience: environment.apiUrl,

              // The attached token should have these scopes
              scope: '',
            },
          },
        ],
      }
```

The `httpInterceptor` attribute will configure the `AuthHttpInterceptor` to intercept every request made to the back to add the bearer token.

### Auth0 sign up / sign in

To launch the Auth0 sign up / sign in workflow, you can add the `AuthGuard` from "@auth0/auth0-angular" to the canActivate of a route to redirect to the Auth0 sign up / sign in page if the current isn't connected.

Alternatively, you can also inject the `AuthService` from "@auth0/auth0-angular" to any component and call `authService.loginWithRedirect()`

## Backend

For the backend part, we should first go back to the Auth0 dashboard and click on Applications > APIs.
Create an API with the identifier `http://localhost:8080`, we can name it `dev` and leave the Signing Algorithm.

This step is important, it will allow your backend to verify the JWT token. 

### Configure Micronaut backend

There are two easy ways to start a new Micronaut. You can generate the project on the [Micronaut launch](https://micronaut.io/launch/) website.
> If you are following along with our sample project, don't forget to add the features : views-thymeleaf, security-oauth2 and security-jwt

The other easy way is the [Micronaut Command Line Interface](https://docs.micronaut.io/latest/guide/#cli) (You can install it using the awesome [Sdkman](https://sdkman.io/)) and the following command :

`mn create-app example.micronaut.auth0 --build=gradle --lang=java  --features=security-jwt,security-oauth2`

If you already have a Micronaut project or you haven't added the security features in Micronaut launch/CLI. You will need to add a few dependencies :

### Add dependencies

Add the `micronaut-security-oauth2` dependency:

Also add Micronaut JWT support `micronaut-security-jwt` dependencies:

> This guide uses Thymeleaf and the Micronaut Security integration module for the view layer. If you are using a different view technology, the Micronaut security configuration and components remain the same.

If you are using Gradle, you can include these dependencies to your project
```groovy

dependencies {
    ...
    implementation("io.micronaut.security:micronaut-security-jwt")
    implementation("io.micronaut.security:micronaut-security-oauth2")
    ...
}
```

### Write your application

If you use IntelliJ IDEA, make sure to enable annotation processing.
![Annotation Processors](docs/annotationprocessorsintellij.png)

#### Configure Micronaut security

Add the following OAuth2 Configuration:

```
micronaut:
    server:
        cors:
            enabled: true
    application:
        name: backend
    security:
        token:
            jwt:
                signatures:
                    jwks:
                        auth0:
                            url: ${OAUTH_JWTKS_URL}
    netty:
        default:
            allocator:
            max-order: 3
```
In this configuration, you tell Micronaut security to rely on `jwks` endpoint to validate the JWT token. The URL will be `https://[YOUR_DOMAIN].eu.auth0.com/.well-known/jwks.json`
`JWKS` stands for JSON Web Key Set. The JWKS endpoint is an URL to a JSON payload that contains a set of public keys used to verify any JSON Web Token (JWT) issued by the authorization server and signed using the RS256 signing algorithm.

On each requests, Micronaut security fetches the OpenId configuration from Auth0 (at `https://xxx.eu.auth0.com/.well-know/openid-configuration`) or uses one cached from a previous request and validate the JSON Web Token placed in the `Authorization` header of the request.

#### Add a Controller

Create a java file suffixed by `Controller` (`HomeController` for example).
You can start this controller with the following content.

```java
@Controller
public class HomeController {

    @Secured(SecurityRule.IS_AUTHENTICATED)
    @Get("/api/me")
    public HttpResponse<Map<String, String>> me(Authentication authentication) {
        HashMap<String, String> result = new HashMap<>();
        result.put("name", authentication.getName());
        authentication.getAttributes().forEach((key, value) -> {
            result.put(key, value.toString());
        });
        return HttpResponse.ok(result);
    }
}

```

The `@Controller` annotation tells Micronaut that this class is a controller.
The `@Secured(SecurityRule.IS_AUTHENTICATED)` annotation tells Micronaut security to check that the current user is authenticated. Micronaut security allow us to restrict access to the application based on the authentication status but also on roles.
The `@Get` annotation tells Micronaut to respond to `GET` Http requests

The `me` method has one parameter called authentication. The `Authentication` object includes information about the current user (like information contained in the idtoken). We allow this parameter to be `null` for anonymous users. The instructions of this method take the `attributes` field of `authentication` and simply return it to the view. (You probably shouldn't do this in production for security reasons)

## Let's try it

Congratulation! Now that you have completed all this steps, you can run and test your application.
> If you are using Gradle, run `./gradlew run`

## To go further

- [Micronaut documentation](https://docs.micronaut.io/latest/guide/)
- [Micronaut security documentation](https://micronaut-projects.github.io/micronaut-security/latest/guide/)
- [Auth0 Angular](https://www.npmjs.com/package/@auth0/auth0-angular)

## Acknowledgement

Thanks to Sergio del Amo for the guide https://guides.micronaut.io/latest/micronaut-oauth2-auth0-gradle-java.html
