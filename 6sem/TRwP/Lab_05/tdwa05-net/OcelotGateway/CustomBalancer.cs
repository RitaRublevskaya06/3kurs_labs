using Microsoft.AspNetCore.Http;
using Ocelot.Configuration;
using Ocelot.LoadBalancer.Interfaces;
using Ocelot.Responses;
using Ocelot.Values;

namespace OcelotGateway
{
    // Пользовательский балансировщик с весами 50%, 30%, 20%
    public class CustomWeightedBalancer : ILoadBalancer
    {
        private readonly List<ServiceHostAndPort> _services;
        private readonly Random _random = new Random();
        private readonly double[] _weights = { 0.5, 0.3, 0.2 };

        public CustomWeightedBalancer(List<ServiceHostAndPort> services)
        {
            _services = services;
        }

        public string Type => nameof(CustomWeightedBalancer);

        public async Task<Response<ServiceHostAndPort>> LeaseAsync(HttpContext httpContext)
        {
            double randomValue = _random.NextDouble();
            double cumulative = 0;
            int selectedIndex = 0;

            for (int i = 0; i < _weights.Length; i++)
            {
                cumulative += _weights[i];
                if (randomValue <= cumulative)
                {
                    selectedIndex = i;
                    break;
                }
            }

            var selected = _services[selectedIndex];
            return new OkResponse<ServiceHostAndPort>(selected);
        }

        public void Release(ServiceHostAndPort hostAndPort)
        {
        }
    }

    // Фабрика для создания пользовательского балансировщика
    public class CustomWeightedLoadBalancerFactory : ILoadBalancerFactory
    {
        // Возвращаем Response<ILoadBalancer> как требует интерфейс
        public Response<ILoadBalancer> Get(DownstreamRoute route, ServiceProviderConfiguration config)
        {
            var services = route.DownstreamAddresses
                .Select(addr => new ServiceHostAndPort(addr.Host, addr.Port))
                .ToList();

            ILoadBalancer balancer = new CustomWeightedBalancer(services);
            return new OkResponse<ILoadBalancer>(balancer);
        }
    }
}