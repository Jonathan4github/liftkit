import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VARIANT_GENERATOR } from './variant-generator.interface';
import { FakeVariantGenerator } from './fake-variant-generator';

@Module({
  providers: [
    FakeVariantGenerator,
    {
      provide: VARIANT_GENERATOR,
      inject: [ConfigService, FakeVariantGenerator],
      useFactory: (config: ConfigService, fake: FakeVariantGenerator) => {
        const mode = config.get<string>('AI_MODE') ?? 'fake';
        if (mode === 'real') {
          // ClaudeVariantGenerator plugs in here for the final demo.
          Logger.warn('AI_MODE=real not wired yet; using fake generator', 'AiModule');
        }
        return fake;
      },
    },
  ],
  exports: [VARIANT_GENERATOR],
})
export class AiModule {}