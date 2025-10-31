<?php
require_once __DIR__ . '/Response.php';
class Router
{
    private $routes = [];

    public function get($path, $callback)
    {
        $this->routes['GET'][$path] = $callback;
    }

    public function post($path, $callback)
    {
        $this->routes['POST'][$path] = $callback;
    }

    public function put($path, $callback)
    {
        $this->routes['PUT'][$path] = $callback;
    }

    public function delete($path, $callback)
    {
        $this->routes['DELETE'][$path] = $callback;
    }

    public function getRoutes()
    {
        return $this->routes;
    }

    public function dispatch()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        

        $path = rtrim($path, '/');
        if (empty($path)) {
            $path = '/';
        }
        if (isset($this->routes[$method][$path])) {
            call_user_func($this->routes[$method][$path]);
            return;
        }

        foreach ($this->routes[$method] as $route => $callback) {
            $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $route);
            $pattern = "#^" . $pattern . "$#";

            if (preg_match($pattern, $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                if (is_array($callback)) {
                    $controller = $callback[0];
                    $methodName = $callback[1];
                    call_user_func_array([$controller, $methodName], $params);
                } else {
                    call_user_func_array($callback, $params);
                }
                return;
            }
        }

        Response::error('Endpoint no encontrado: ' . $path, 404);
    }
}
