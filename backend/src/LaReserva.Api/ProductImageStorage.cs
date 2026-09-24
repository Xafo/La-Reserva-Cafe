using System.Net.Http.Headers;

namespace LaReserva.Api;

public sealed class ProductImageStorage(IConfiguration configuration, HttpClient http)
{
    public async Task<string> SaveAsync(IFormFile file, string filename, CancellationToken cancellationToken)
    {
        if (configuration["Uploads:Provider"] != "Supabase")
        {
            var path = Path.Combine(configuration["Uploads:Path"] ?? "/app/uploads", filename);
            await using var destination = File.Create(path);
            await file.CopyToAsync(destination, cancellationToken);
            return $"/uploads/{filename}";
        }

        var url = configuration["Uploads:SupabaseUrl"]?.TrimEnd('/')
            ?? throw new InvalidOperationException("Falta Uploads:SupabaseUrl.");
        var key = configuration["Uploads:SupabaseKey"]
            ?? throw new InvalidOperationException("Falta Uploads:SupabaseKey.");
        var bucket = Uri.EscapeDataString(configuration["Uploads:Bucket"] ?? "product-images");
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{url}/storage/v1/object/{bucket}/{filename}");
        request.Headers.Add("apikey", key);
        // Las claves secret modernas se envían solo en apikey; service_role usa JWT.
        if (!key.StartsWith("sb_secret_", StringComparison.Ordinal))
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", key);
        request.Content = new StreamContent(file.OpenReadStream());
        request.Content.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
        using var response = await http.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        return $"{url}/storage/v1/object/public/{bucket}/{filename}";
    }
}
