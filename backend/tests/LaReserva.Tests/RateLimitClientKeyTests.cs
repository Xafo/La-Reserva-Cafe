using System.Net;
using LaReserva.Api;
using Microsoft.AspNetCore.Http;

namespace LaReserva.Tests;

public sealed class RateLimitClientKeyTests
{
    [Fact]
    public void IgnoresClientSuppliedForwardingHeaders()
    {
        var context = new DefaultHttpContext();
        context.Connection.RemoteIpAddress = IPAddress.Parse("203.0.113.24");
        context.Request.Headers["CF-Connecting-IP"] = "198.51.100.8";
        context.Request.Headers["X-Forwarded-For"] = "192.0.2.31";

        Assert.Equal("203.0.113.24", RateLimitClientKey.From(context));
    }
}
