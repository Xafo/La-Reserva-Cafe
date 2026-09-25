using LaReserva.Api;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace LaReserva.Tests;

public sealed class ProductImageStorageTests
{
    [Fact]
    public async Task LocalImages_SurviveServiceRecreationAndFileBackupRestore()
    {
        var root = Path.Combine(Path.GetTempPath(), $"directo-image-test-{Guid.NewGuid():N}");
        var uploads = Directory.CreateDirectory(Path.Combine(root, "uploads")).FullName;
        var restored = Directory.CreateDirectory(Path.Combine(root, "restored")).FullName;
        try
        {
            var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Uploads:Path"] = uploads,
            }).Build();
            // Tiny local PNG fixture; no connection to an external storage provider.
            var bytes = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=");
            using var http = new HttpClient();
            await using var stream = new MemoryStream(bytes);
            var file = new FormFile(stream, 0, bytes.Length, "file", "fixture.png") { Headers = new HeaderDictionary(), ContentType = "image/png" };
            var storage = new ProductImageStorage(config, http);
            Assert.Equal("/uploads/fixture.png", await storage.SaveAsync(file, "fixture.png", default));
            _ = new ProductImageStorage(config, http);
            Assert.Equal(bytes, await File.ReadAllBytesAsync(Path.Combine(uploads, "fixture.png")));
            var backup = Path.Combine(root, "fixture-backup.png");
            File.Copy(Path.Combine(uploads, "fixture.png"), backup);
            File.Copy(backup, Path.Combine(restored, "fixture.png"));
            Assert.Equal(bytes, await File.ReadAllBytesAsync(Path.Combine(restored, "fixture.png")));
        }
        finally
        {
            Directory.Delete(root, recursive: true);
        }
    }
}
