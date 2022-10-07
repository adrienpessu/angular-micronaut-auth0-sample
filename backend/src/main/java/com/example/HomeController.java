package com.example;

import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.security.annotation.Secured;
import io.micronaut.security.authentication.Authentication;
import io.micronaut.security.rules.SecurityRule;

import java.util.HashMap;
import java.util.Map;

@Controller()
public class HomeController {

    @Secured(SecurityRule.IS_ANONYMOUS)
    @Get()
    public HttpResponse<String> home() {
        return HttpResponse.ok("Hello world");
    }

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
