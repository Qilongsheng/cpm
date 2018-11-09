const {
  Get, Put, Delete,
  Order,
  Controller,
  Middleware,
  ApplicationComponent,
} = require('@clusic/method');

@Controller()
@Order(2)
class IndexController extends ApplicationComponent {
  constructor(ctx) {
    super(ctx);
  }
  
  @Get('/')
  async welcome() {
    this.ctx.body = 'Welcome to use Rex';
  }

  @Put(/^\/(\@[a-z][a-z0-9\_\-\.\%]+(\/[a-z][a-z0-9\_\-\.]+)?)\/\-rev\/(.+)$/)
  @Middleware('Login')
  @Middleware('Body')
  async UpdatePackage() {
    const pkg = this.ctx.request.body;
    await this.Service.Package.UpdatePackage(pkg);
    this.ctx.body = {
      ok: true
    }
  }

  @Delete(/^\/(\@[a-z][a-z0-9\_\-\.\%]+(\/[a-z][a-z0-9\_\-\.]+)?)\/\-rev\/(.+)$/)
  @Middleware('Login')
  async DeletePackageEntries() {
    const pathname = this.ctx.params[0];
    await this.Service.Package.DeleteAll(pathname);
    this.ctx.body = {
      ok: true
    }
  }

  @Delete('/download/:scope/:package-:version.tgz/-rev/:rev')
  @Middleware('Login')
  async DeletePackageByVersion() {
    const scope = this.ctx.params.scope;
    const pkg = this.ctx.params.package;
    const version = this.ctx.params.version;
    if (!scope) throw this.ctx.error('you can not delete private package', 400);
    this.ctx.body = await this.Service.Version.DeleteVersion(scope + '/' + pkg, version);
  }

  @Get(/^\/(\@[a-z][a-z0-9\_\-\.\%]+(\/[a-z][a-z0-9\_\-\.]+)?)(\/(\d+\.\d+\.[a-z0-9\-\_\.]+))?$/)
  async GetScopePackage() {
    const pathname = decodeURIComponent(this.ctx.params[0]);
    const version = this.ctx.params[3];
    this.ctx.type = 'application/json; charset=utf-8';
    if (version) return this.ctx.body = await this.Service.Package.VersionPackage(pathname, version);
    this.ctx.body = await this.Service.Package.ListPackages(pathname);
  }

  @Get(/^\/([a-z][a-z0-9\_\-\.]+)(\/(\d+\.\d+\.[a-z0-9\-\_\.]+))?$/)
  async GetNormalizePackage() {
    const pathname = this.ctx.params[0];
    const version = this.ctx.params[2];
    this.ctx.type = 'application/json; charset=utf-8';
    if (version) return this.ctx.body = await this.Service.Package.VersionPackage(pathname, version);
    this.ctx.body = await this.Service.Package.ListPackages(pathname);
  }

  @Put(/^\/(\@[a-z][a-z0-9\_\-\.\%]+)$/)
  @Middleware('Login')
  @Middleware('Body')
  async Publish() {
    const pkg = this.ctx.request.body;
    const username = this.ctx.account;
    const result = await this.Service.Package.Publish(pkg, username);
    this.ctx.status = 200;
    this.ctx.body = result;
  }

  @Put(/^\/([a-z][a-z0-9\_\-\.]+)$/)
  async ForbidPublish() {
    throw this.ctx.error('you can not publish private package.');
  }
}

module.exports = IndexController;